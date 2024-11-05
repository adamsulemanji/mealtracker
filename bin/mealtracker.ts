#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MealtrackerStack } from '../lib/mealtracker-stack';

const app = new cdk.App();
new MealtrackerStack(app, 'MealtrackerStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});