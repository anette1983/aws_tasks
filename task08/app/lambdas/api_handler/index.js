const OpenMeteoSDK = require('/opt/nodejs/openMeteoSDK');

const openMeteo = new OpenMeteoSDK('https://api.open-meteo.com/v1/forecast');

exports.handler = async (event) => {
	try {
		const latitude = 52.52;
		const longitude = 13.41;

		const weatherData = await openMeteo.getWeatherForecast(latitude, longitude);

		return {
			statusCode: 200,
			body: JSON.stringify(weatherData),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message }),
		};
	}
};
