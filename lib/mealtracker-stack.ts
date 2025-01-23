import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGatewayConstruct } from './apigateway';
import { LambdaConstruct } from './lambda';
import { DynamoDBConstruct } from './ddb';
import { FrontendConstruct } from './cloudfront';

export class MealtrackerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ********** DynamoDB **********
    const ddb = new DynamoDBConstruct(this, 'DynamoDBConstruct');

    // ********** Lambda **********
    const lambda = new LambdaConstruct(this, 'LambdaConstruct', [ddb.mealsTable_prod, ddb.mealsTable_dev]);

    // ********** API Gateway **********
    const api = new ApiGatewayConstruct(this, 'ApiGatewayConstruct', [lambda.meals_prod, lambda.meals_dev]);

    // ********** Frontend **********
    new FrontendConstruct(this, 'FrontendConstruct', [api.api_prod, api.api_dev]);

    // ********** Grant Permissions **********

    ddb.mealsTable_prod.grantReadWriteData(lambda.meals_prod);
    ddb.mealsTable_dev.grantReadWriteData(lambda.meals_dev);


  }
}
