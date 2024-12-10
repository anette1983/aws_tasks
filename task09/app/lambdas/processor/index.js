const axios = require('axios');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const WEATHER_TABLE = process.env.target_table;

exports.handler = async () => {
	try {
		const response = await axios.get(
			'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m'
		);

		const weatherData = response.data;

		const formattedData = {
			id: uuidv4(),
			forecast: {
				elevation: weatherData.elevation,
				generationtime_ms: weatherData.generationtime_ms,
				hourly: {
					temperature_2m: weatherData.hourly.temperature_2m,
					time: weatherData.hourly.time,
				},
				hourly_units: {
					temperature_2m: weatherData.hourly_units.temperature_2m,
					time: weatherData.hourly_units.time,
				},
				latitude: weatherData.latitude,
				longitude: weatherData.longitude,
				timezone: weatherData.timezone,
				timezone_abbreviation: weatherData.timezone_abbreviation,
				utc_offset_seconds: weatherData.utc_offset_seconds,
			},
		};

		await dynamoDB
			.put({
				TableName: WEATHER_TABLE,
				Item: formattedData,
			})
			.promise();

		return {
			statusCode: 200,
			body: JSON.stringify({ message: 'Weather data stored successfully' }),
		};
	} catch (error) {
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: 'Error fetching or storing weather data',
				error,
			}),
		};
	}
};
