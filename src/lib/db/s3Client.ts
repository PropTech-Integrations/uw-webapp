import { S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';    
import { COGNITO_IDENTITY_POOL_ID, REGION } from '$env/static/private';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';

export const s3 = new S3Client({
    region: REGION,
    credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: REGION }),
        identityPoolId: COGNITO_IDENTITY_POOL_ID
    })
});