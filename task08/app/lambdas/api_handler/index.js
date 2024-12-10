const axios = require('axios');

exports.handler = async (event) => {
	try {
		const latitude = 52.52;
		const longitude = 13.41;
		const baseURL = 'https://api.open-meteo.com/v1/forecast';

		const response = await axios.get(baseURL, {
			params: {
				latitude,
				longitude,
				current: 'temperature_2m,wind_speed_10m',
				hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m',
			},
		});

		const weatherData = response.data;

		// if (!weatherData.hourly) {
		// 	throw new Error('The hourly field is missing in the API response');
		// }

		return {
			statusCode: 200,
			body: JSON.stringify(weatherData),
		};
	} catch (error) {
		console.error('Error in Lambda:', error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message }),
		};
	}
};
