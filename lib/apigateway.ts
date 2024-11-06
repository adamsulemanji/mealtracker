import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class ApiGatewayConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    lambdaFunction: lambda.Function,
  ) {
    super(scope, id);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'MealsAPIGateway', {
      restApiName: 'MealsAPIGateway',
      description: 'APIGateway for Meals tracking purposes',
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
      },
    });

    // Resource: /meals
    const meals = api.root.addResource('meals');

    // GET /meals - Get all meals
    const getAllMealsIntegration = new apigateway.LambdaIntegration(lambdaFunction);
    meals.addMethod('GET', getAllMealsIntegration);

    // Resource: /meals/{id}
    const mealById = meals.addResource('{id}');

    // GET /meals/{id} - Get a meal by ID
    const getMealByIdIntegration = new apigateway.LambdaIntegration(lambdaFunction);
    mealById.addMethod('GET', getMealByIdIntegration);

    // PUT /meals/{id} - Update a meal by ID
    const updateMealByIdIntegration = new apigateway.LambdaIntegration(lambdaFunction);
    mealById.addMethod('PUT', updateMealByIdIntegration);

    // DELETE /meals/{id} - Delete a meal by ID
    const deleteMealByIdIntegration = new apigateway.LambdaIntegration(lambdaFunction);
    mealById.addMethod('DELETE', deleteMealByIdIntegration);

    // DELETE /meals - Delete all meals
    const deleteAllMealsIntegration = new apigateway.LambdaIntegration(lambdaFunction);
    meals.addMethod('DELETE', deleteAllMealsIntegration);
  }
}
