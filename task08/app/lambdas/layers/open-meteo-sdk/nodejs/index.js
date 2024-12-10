const axios = require('axios');

class OpenMeteoSDK {
	constructor(baseURL) {
		this.apiClient = axios.create({ baseURL });
	}

	async getWeatherForecast(latitude, longitude) {
		try {
			const response = await this.apiClient.get('', {
				params: {
					latitude,
					longitude,
					current: 'temperature_2m,wind_speed_10m',
					hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m',
				},
			});
			return response.data;
		} catch (error) {
			console.error('Error fetching weather data:', error);
			throw new Error('Failed to fetch weather data');
		}
	}
}

module.exports = OpenMeteoSDK;
