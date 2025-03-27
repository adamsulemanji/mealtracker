import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class LambdaConstruct extends Construct {
  public readonly meals_prod: lambda.Function;
  public readonly meals_dev: lambda.Function

  constructor(
    scope: Construct,
    id: string,
    dynamos: dynamodb.Table[],
  ) {
    super(scope, id);

    // ******* Get the DynamoDB table name *******
    const mealsTableName = dynamos[0].tableName;

    // ********** Lambda for Meals **********
    this.meals_prod = new lambda.DockerImageFunction(
			this,
			"MealFunction-prod",
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
					TABLE_NAME: dynamos[0].tableName,
				},
        architecture: lambda.Architecture.X86_64,
			}
		);

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
          TABLE_NAME: dynamos[1].tableName,
        },
        architecture: lambda.Architecture.X86_64,
      }
    );
  }
}
