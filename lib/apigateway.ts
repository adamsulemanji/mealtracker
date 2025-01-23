import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cognito from "aws-cdk-lib/aws-cognito";

export class ApiGatewayConstruct extends Construct {
	public readonly api_prod: apigateway.LambdaRestApi;
	public readonly api_dev: apigateway.LambdaRestApi;
	constructor(scope: Construct, id: string, lambdas: lambda.Function[]) {
		super(scope, id);

		this.api_prod = new apigateway.LambdaRestApi(this, "MealsAPIG-prod", {
			handler: lambdas[0],
			proxy: true,
			description:
				"APIGateway Proxy service for Meals API for Production",
		});

		this.api_dev = new apigateway.LambdaRestApi(this, "MealsAPIG-dev", {
			handler: lambdas[1],
			proxy: true,
			description:
				"APIGateway Proxy service for Meals API for Development",
		});
	}
}
