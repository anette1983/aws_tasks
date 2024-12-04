const AWS = require('aws-sdk');
const { v4: generateUuid } = require('uuid');

const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	const auditTableName = process.env.TARGET_TABLE;

	for (const record of event.Records) {
		if (!record) continue;

		const actionType = record.eventName;
		const newData = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
		const oldData = record.dynamodb.OldImage
			? AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage)
			: null;

		let auditEntry = null;

		if (actionType === 'INSERT') {
			auditEntry = {
				id: generateUuid(),
				itemKey: newData.key,
				modificationTime: new Date().toISOString(),
				newValue: newData,
			};
		} else if (actionType === 'MODIFY') {
			if (newData.value !== oldData?.value) {
				auditEntry = {
					id: generateUuid(),
					itemKey: newData.key,
					modificationTime: new Date().toISOString(),
					updatedAttribute: 'value',
					oldValue: oldData?.value,
					newValue: newData.value,
				};
			}
		}

		if (auditEntry) {
			try {
				await dynamoDbClient
					.put({
						TableName: auditTableName,
						Item: auditEntry,
					})
					.promise();
				console.log('Audit entry created:', JSON.stringify(auditEntry));
			} catch (error) {
				console.error('Failed to create audit entry:', error);
			}
		}
	}

	return { status: 'success' };
};
