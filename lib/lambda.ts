import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class LambdaConstruct extends Construct {
  public readonly meals_prod: lambda.Function;
  public readonly meals_dev: lambda.Function
  public readonly meals_go: lambda.Function

  constructor(
    scope: Construct,
    id: string,
    dynamos: dynamodb.Table[],
  ) {
    super(scope, id);

    // ******* Get the DynamoDB table name *******
    const mealsTableName = dynamos[0].tableName;
    const mealsTableNameDev = dynamos[1].tableName;

    this.meals_dev = new lambda.DockerImageFunction(
      this,
      "MealFunction-dev",
      {
        code: lambda.DockerImageCode.fromImageAsset(
          path.join(__dirname, "../api"),
          {
            buildArgs: {
              "--platform": "linux/amd64",
            },
          }
        ),
        memorySize: 512,
        timeout: cdk.Duration.seconds(30),
        environment: {
          TABLE_NAME: mealsTableNameDev,
        },
        architecture: lambda.Architecture.X86_64,
      }
    );

    this.meals_go = new lambda.DockerImageFunction(
      this,
      "MealFunction-go",
      {
        code: lambda.DockerImageCode.fromImageAsset(
          path.join(__dirname, "../go_api"),
        ),
        memorySize: 128,
        timeout: cdk.Duration.seconds(30),
        environment: {
          TABLE_NAME: mealsTableName,
        },
        architecture: lambda.Architecture.X86_64,
      }
    );

  }
}
