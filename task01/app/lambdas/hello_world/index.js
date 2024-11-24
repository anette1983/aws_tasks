exports.handler = async (event) => {
	console.log('Hello from Lambda');
	const response = {
		statusCode: 200,
		message: 'Hello from Lambda',
	};
	return response;
};
