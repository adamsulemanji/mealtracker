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
    const lambda = new LambdaConstruct(this, 'LambdaConstruct', [ddb.mealsTable]);

    // ********** API Gateway **********
    new ApiGatewayConstruct(this, 'ApiGatewayConstruct', lambda.meals);

    // ********** Frontend **********
    new FrontendConstruct(this, 'FrontendConstruct');

    // ********** Grant Permissions **********

    ddb.mealsTable.grantFullAccess(lambda.meals);
    lambda.meals


  }
}
