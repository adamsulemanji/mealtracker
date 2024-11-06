import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class LambdaConstruct extends Construct {
  public readonly meals: lambda.Function;

  constructor(
    scope: Construct,
    id: string,
    dynamos: dynamodb.Table[],
  ) {
    super(scope, id);

    // ******* Get the DynamoDB table name *******
    const mealsTableName = dynamos[0].tableName;

    // ********** Lambda for Meals **********
    this.meals = new lambda.Function(this, 'MealsLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'meals.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        USERS_TABLE_NAME: mealsTableName,
      },
    });
  }
}
