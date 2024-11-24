exports.handler = async (event) => {
	console.log('Event received:', event);
	const path = event.rawPath || '/';
	const httpMethod = event.requestContext?.http?.method || 'UNKNOWN';

	if (path !== '/hello' && httpMethod !== 'GET') {
		return {
			statusCode: 400,
			message: `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${httpMethod}`,
		};
	}
	return {
		statusCode: 200,
		message: 'Hello from Lambda',
	};
};
