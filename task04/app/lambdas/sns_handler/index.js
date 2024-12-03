exports.handler = async (event) => {
	console.log('SNS Event:', JSON.stringify(event, null, 2));
	return { statusCode: 200, body: 'Notification logged' };
};
