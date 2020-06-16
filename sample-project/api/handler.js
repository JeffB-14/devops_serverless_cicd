const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
var secretsmanager = new AWS.SecretsManager();
var logger = require('logger').createLogger();

logger.setLevel('debug');

function getSecrets() {
    var params = {
        SecretId: process.env.SECRET_ARN, 
        VersionStage: "AWSCURRENT"
    };
    return secretsmanager.getSecretValue(params).promise();
}

var secretdata;

exports.sample = async (event, context, callback) => {
    const id = event.pathParameters.id;
    const httpMethod = event.httpMethod;
    logger.info(`id: ${id}`)
    logger.info(`httpMethod: ${httpMethod}`)
    if (secretdata) {
        logger.debug('secrets retrieved from cache');
    } else {
        secretdata = (await getSecrets()).SecretString;
        logger.debug('secrets retrieved from secret in master account');
    }
    if (httpMethod === 'GET') {
        logger.info(`inside get`)
        const value = await sampleGet(id);
        logger.info(`value: ${JSON.stringify(value, null, '\t')}`)
        const response = apiGatewayResponse(200, value);
        logger.info(`response: ${JSON.stringify(response, null, '\t')}`)
        callback(null, response);
    } else if (httpMethod === 'POST') {
        logger.info(`inside post`)
        const value = await samplePost(id, event);
        logger.info(`value: ${JSON.stringify(value, null, '\t')}`)
        const response = apiGatewayResponse(200, value);
        logger.info(`response: ${JSON.stringify(response, null, '\t')}`)
        callback(null, response);
    } else {
        callback(new Error('not called via APIG GET or POST. Did you try testing this from the Lambda Console? Read the comments in code.'))
        // https://docs.aws.amazon.com/lambda/latest/dg/eventsources.html#eventsources-api-gateway-request
        // Set the test event to include the different elements used above if trying this from the console.
    }
}

function sampleGet(key) {
    var params = {
        TableName: process.env.TABLE_NAME,
        Key: { id: key },
        ReturnConsumedCapacity: 'INDEXES'
    };
    return docClient.get(params).promise()
}

function samplePost(key, event) {
    logger.info(`event: ${JSON.stringify(event, null, '\t')}`);
    const date = new Date(Date.now());
    var params = {
        TableName: process.env.TABLE_NAME,
        Item: {
            id: key,
            data: event.body,
            createDate: date.toDateString()
        },
        ReturnConsumedCapacity: 'TOTAL',
        ReturnItemCollectionMetrics: 'SIZE'
    };
    return docClient.put(params).promise()
}

function apiGatewayResponse(statusCode, body) {
    return {
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(body, null, '\t'),
        statusCode: statusCode
    }
}