import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DynamoDBConstruct extends Construct {
  public readonly mealsTable_prod: dynamodb.Table;
  public readonly mealsTable_dev: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // ******* Meals Table *******
    this.mealsTable_prod = new dynamodb.Table(this, 'MealsTable-prod', {
      partitionKey: { name: 'mealID', type: dynamodb.AttributeType.STRING },
      tableName: 'MealsTable_prod',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
    });

    this.mealsTable_dev = new dynamodb.Table(this, 'MealsTable-dev', {
      partitionKey: { name: 'mealID', type: dynamodb.AttributeType.STRING },
      tableName: 'MealsTable-dev',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });
  }
}
