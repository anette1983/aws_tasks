const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.target_table;
console.log('Table Name:', tableName);

exports.handler = async (event) => {
	console.log('event', event);
	try {
		const requestBody = JSON.parse(event.body);

		if (!requestBody.principalId || !requestBody.content) {
			return {
				statusCode: 400,
				body: JSON.stringify({ message: 'Invalid request payload' }),
			};
		}

		const newEvent = {
			id: uuidv4(),
			principalId: requestBody.principalId,
			createdAt: new Date().toISOString(),
			body: requestBody.content,
		};
		console.log('New Event:', JSON.stringify(newEvent, null, 2));

		await dynamoDb
			.put({
				TableName: tableName,
				Item: newEvent,
			})
			.promise();

		return {
			statusCode: 201,
			body: JSON.stringify({
				statusCode: 201,
				event: newEvent,
			}),
		};
	} catch (error) {
		console.error('Error saving event:', error);
		return {
			statusCode: 500,
			body: JSON.stringify({ message: 'Internal Server Error' }),
		};
	}
};
