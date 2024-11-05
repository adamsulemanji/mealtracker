import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DynamoDBConstruct extends Construct {
  public readonly mealsTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // ******* Meals Table *******
    this.mealsTable = new dynamodb.Table(this, 'MealsTable', {
      partitionKey: { name: 'mealID', type: dynamodb.AttributeType.STRING },
      tableName: 'MealsTable',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }
}
