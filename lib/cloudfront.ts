import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origin from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as bucket from 'aws-cdk-lib/aws-s3-deployment';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export class FrontendConstruct extends Construct {
    constructor(app: Construct, id: string) {
        super(app, id);

        const domainName = 'adamsulemanji.com';
        const subDomain = 'mealtracker';

        // ********** Frontend Bucket **********
        const myBucket = new s3.Bucket(this, `myBucket-${subDomain}`, {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(
            this,
            `cloudfront-OAI-${subDomain}`
        );

        // ********** Bucket Policy **********
        myBucket.addToResourcePolicy(
            new iam.PolicyStatement({
                actions: ['s3:GetObject'],
                resources: [myBucket.arnForObjects('*')],
                principals: [
                    new iam.CanonicalUserPrincipal(
                        cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
                    ),
                ],
            })
        );

        // ********** Route 53 **********
        const zone = route53.HostedZone.fromLookup(this, 'HostedZone', {
            domainName: domainName,
        });

        // ********** ACM Certificate **********
        const certificate = new acm.Certificate(
            this,
            `Certificate-${subDomain}`,
            {
                domainName: `${subDomain}.${domainName}`,
                validation: acm.CertificateValidation.fromDns(zone),
            }
        );

        // ********** CloudFront Distribution **********
        const s3Origin = new origin.S3Origin(myBucket);

        const distribution = new cloudfront.Distribution(
            this,
            `myDist-${subDomain}`,
            {
                defaultBehavior: {
                    origin: s3Origin,
                    viewerProtocolPolicy:
                        cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                },
                defaultRootObject: 'index.html',
                domainNames: [`${subDomain}.${domainName}`],
                certificate,
                errorResponses: [
                    {
                        httpStatus: 403,
                        responseHttpStatus: 200,
                        responsePagePath: '/index.html',
                        ttl: cdk.Duration.minutes(1),
                    },
                    {
                        httpStatus: 404,
                        responseHttpStatus: 200,
                        responsePagePath: '/index.html',
                        ttl: cdk.Duration.minutes(1),
                    },
                ],
            }
        );

        // ********** Route 53 Alias Record **********
        new route53.ARecord(this, `AliasRecord-${subDomain}`, {
            zone,
            recordName: `${subDomain}`,
            target: route53.RecordTarget.fromAlias(
                new route53targets.CloudFrontTarget(distribution)
            ),
        });

        // ********** Bucket Deployment **********
        new bucket.BucketDeployment(
            this,
            `DeployWithInvalidation-${subDomain}`,
            {
                sources: [bucket.Source.asset('./frontend/build')],
                destinationBucket: myBucket,
                distribution,
                memoryLimit: 1024,
                ephemeralStorageSize: cdk.Size.mebibytes(1024),
                distributionPaths: ['/*'],
            }
        );

        // ********** Output **********
        new cdk.CfnOutput(this, `DistributionDomainName-${subDomain}`, {
            value: distribution.domainName,
            description: `Distribution Domain Name for ${subDomain}`,
            exportName: `DistributionDomainName-${subDomain}`,
        });
    }
}
