const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3();
const bucketName = process.env.TARGET_BUCKET;

exports.handler = async (event) => {
	try {
		const uuids = Array.from({ length: 10 }, () => uuidv4());
		const timestamp = new Date().toISOString();

		const fileContent = {
			ids: uuids,
		};

		const fileName = `${timestamp}`;

		await s3
			.putObject({
				Bucket: bucketName,
				Key: fileName,
				Body: JSON.stringify(fileContent),
				ContentType: 'application/json',
			})
			.promise();

		console.log(
			`File ${fileName} uploaded successfully to bucket ${bucketName}.`
		);

		return {
			statusCode: 200,
			body: JSON.stringify({ message: 'File created successfully', fileName }),
		};
	} catch (error) {
		console.error('Error:', error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: error.message }),
		};
	}
};
