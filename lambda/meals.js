const {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { randomUUID: generateUUID } = require('crypto');

const ddbClient = new DynamoDBClient({});
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

const TABLE_NAME = 'MealsTable';

const handler = async (event) => {
  const method = event.httpMethod;
  const resource = event.resource;
  const pathParameters = event.pathParameters || '';
  const mealId = pathParameters.id;
  const body = event.body;

  console.log('Event:', event);
  console.log('Method:', method);
  console.log('Resource:', resource);
  console.log('Path Parameters:', pathParameters);
  console.log('Body:', body);

  try {
    if (method === 'GET' && resource === '/meals') {
      // GET /meals - Retrieve all meals
      const params = {
        TableName: TABLE_NAME,
      };

      const data = await ddbClient.send(new ScanCommand(params));
      const items = data.Items.map((item) => unmarshall(item));

      console.log('Items:', items);

      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(items),
      };
    } else if (method == 'POST' && resource == '/meals') {
      // POST /meals - Create a new meal
      let requestBody = {};
      if (body) {
        try {
          requestBody = JSON.parse(body);
        } catch (err) {
          return {
            statusCode: 400,
            headers: headers,
            body: JSON.stringify({ message: 'Invalid JSON in request body' }),
          };
        }
      }

      const mealID = generateUUID();
      const params = {
        TableName: TABLE_NAME,
        Item: {
          mealID: { S: mealID },
          mealType: { S: requestBody.mealType },
          mealName: { S: requestBody.mealName },
          eatingOut: { BOOL: requestBody.eatingOut },
          date: { S: requestBody.date },
        },
      };

      await ddbClient.send(new PutItemCommand(params));

      return {
        statusCode: 201,
        headers: headers,
        body: JSON.stringify({
          message: 'Meal created successfully',
          mealId: mealId,
        }),
      };
    } else if (method === 'GET' && resource === '/meals/{id}') {
      // GET /meals/{id} - Retrieve a meal by ID
      if (!mealId) {
        return {
          statusCode: 400,
          headers: headers,
          body: JSON.stringify({
            message: 'mealId is required in path parameters',
          }),
        };
      }

      const params = {
        TableName: TABLE_NAME,
        Key: {
          mealId: { S: mealId },
        },
      };

      const data = await ddbClient.send(new GetItemCommand(params));

      if (!data.Item) {
        return {
          statusCode: 404,
          headers: headers,
          body: JSON.stringify({ message: 'Meal not found' }),
        };
      }

      const item = unmarshall(data.Item);

      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(item),
      };
    } else if (method === 'PUT' && resource === '/meals/{id}') {
      // PUT /meals/{id} - Update a meal by ID
      if (!mealId) {
        return {
          statusCode: 400,
          headers: headers,
          body: JSON.stringify({
            message: 'mealId is required in path parameters',
          }),
        };
      }

      let requestBody = {};
      if (body) {
        try {
          requestBody = JSON.parse(body);
        } catch (err) {
          return {
            statusCode: 400,
            headers: headers,
            body: JSON.stringify({ message: 'Invalid JSON in request body' }),
          };
        }
      }

      const updateExpressions = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};

      for (const [key, value] of Object.entries(requestBody)) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = { S: value };
      }

      const params = {
        TableName: TABLE_NAME,
        Key: {
          mealId: { S: mealId },
        },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW',
      };

      await ddbClient.send(new UpdateItemCommand(params));

      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
          message: 'Meal updated successfully',
          mealId: mealId,
        }),
      };
    } else if (method === 'DELETE' && resource === '/meals/{id}') {
      // DELETE /meals/{id} - Delete a meal by ID
      if (!mealId) {
        return {
          statusCode: 400,
          headers: headers,
          body: JSON.stringify({
            message: 'mealId is required in path parameters',
          }),
        };
      }

      const params = {
        TableName: TABLE_NAME,
        Key: {
          mealId: { S: mealId },
        },
      };

      await ddbClient.send(new DeleteItemCommand(params));

      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
          message: 'Meal deleted successfully',
          mealId: mealId,
        }),
      };
    } else if (method === 'DELETE' && resource === '/meals') {
      // DELETE /meals - Delete all meals
      const scanParams = {
        TableName: TABLE_NAME,
      };

      const data = await ddbClient.send(new ScanCommand(scanParams));
      const deletePromises = data.Items.map((item) => {
        const deleteParams = {
          TableName: TABLE_NAME,
          Key: {
            mealId: item.mealId,
          },
        };
        return ddbClient.send(new DeleteItemCommand(deleteParams));
      });

      await Promise.all(deletePromises);

      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
          message: 'All meals deleted successfully',
        }),
      };
    } else {
      // Method Not Allowed
      return {
        statusCode: 405,
        headers: headers,
        body: JSON.stringify({ message: 'Method Not Allowed' }),
      };
    }
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: err.message,
      }),
    };
  }
};

module.exports = { handler };
