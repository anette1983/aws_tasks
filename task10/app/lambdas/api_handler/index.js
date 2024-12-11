const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

// Хендлер для /signup
const handleSignup = async (event) => {
	console.log(event);

	const body = JSON.parse(event.body);

	const { firstName, lastName, email, password } = body;

	try {
		const params = {
			UserPoolId: process.env.CUPId,
			Username: email,
			TemporaryPassword: password,
			UserAttributes: [
				{ Name: 'email', Value: email },
				{ Name: 'custom:firstName', Value: firstName },
				{ Name: 'custom:lastName', Value: lastName },
			],
			MessageAction: 'SUPPRESS',
		};

		await cognito.adminCreateUser(params).promise();

		return {
			statusCode: 200,
			body: JSON.stringify({ message: 'User signed up successfully!' }),
		};
	} catch (error) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: error.message }),
		};
	}
};

// Хендлер для /signin
const handleSignin = async (event) => {
	const body = JSON.parse(event.body);
	const { email, password } = body;

	try {
		const params = {
			AuthFlow: 'USER_PASSWORD_AUTH',
			ClientId: process.env.CUPClientId,
			AuthParameters: {
				USERNAME: email,
				PASSWORD: password,
			},
		};

		const response = await cognito.initiateAuth(params).promise();

		return {
			statusCode: 200,
			body: JSON.stringify({
				accessToken: response.AuthenticationResult.IdToken,
			}),
		};
	} catch (error) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: error.message }),
		};
	}
};

// Хендлер для /tables GET
const handleGetTables = async () => {
	try {
		const params = {
			TableName: process.env.Tables,
		};

		const data = await dynamodb.scan(params).promise();

		return {
			statusCode: 200,
			body: JSON.stringify({ tables: data.Items }),
		};
	} catch (error) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: error.message }),
		};
	}
};

// Хендлер для /tables POST
const handleCreateTable = async (event) => {
	const body = JSON.parse(event.body);

	try {
		const params = {
			TableName: process.env.Tables,
			Item: {
				id: body.id,
				number: body.number,
				places: body.places,
				isVip: body.isVip,
				minOrder: body.minOrder || null,
			},
		};

		await dynamodb.put(params).promise();

		return {
			statusCode: 200,
			body: JSON.stringify({ id: body.id }),
		};
	} catch (error) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: error.message }),
		};
	}
};

// Хендлер для /reservations POST
const handleCreateReservation = async (event) => {
	const body = JSON.parse(event.body);
	const {
		tableNumber,
		clientName,
		phoneNumber,
		date,
		slotTimeStart,
		slotTimeEnd,
	} = body;

	if (
		!tableNumber ||
		!clientName ||
		!phoneNumber ||
		!date ||
		!slotTimeStart ||
		!slotTimeEnd
	) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: 'Missing required fields' }),
		};
	}

	const reservationId = uuidv4();

	try {
		const params = {
			TableName: process.env.Reservations,
			Item: {
				id: reservationId,
				tableNumber,
				clientName,
				phoneNumber,
				date,
				slotTimeStart,
				slotTimeEnd,
			},
		};

		await dynamodb.put(params).promise();

		return {
			statusCode: 200,
			body: JSON.stringify({ reservationId }),
		};
	} catch (error) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: error.message }),
		};
	}
};

// Хендлер для /reservations GET
const handleGetReservations = async () => {
	try {
		const params = {
			TableName: process.env.Reservations,
		};

		const data = await dynamodb.scan(params).promise();

		return {
			statusCode: 200,
			body: JSON.stringify({ reservations: data.Items }),
		};
	} catch (error) {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: error.message }),
		};
	}
};

// Хендлер для маршрутизації
exports.handler = async (event) => {
	const { path, httpMethod } = event;

	if (path === '/signup' && httpMethod === 'POST') {
		return await handleSignup(event);
	}

	if (path === '/signin' && httpMethod === 'POST') {
		return await handleSignin(event);
	}

	if (path === '/tables' && httpMethod === 'GET') {
		return await handleGetTables(event);
	}

	if (path === '/tables' && httpMethod === 'POST') {
		return await handleCreateTable(event);
	}

	if (path === '/reservations' && httpMethod === 'POST') {
		return await handleCreateReservation(event);
	}

	if (path === '/reservations' && httpMethod === 'GET') {
		return await handleGetReservations(event);
	}

	return {
		statusCode: 404,
		body: JSON.stringify({ error: 'Route not found' }),
	};
};
