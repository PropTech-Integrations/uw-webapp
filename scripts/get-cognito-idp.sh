# Replace these values
USER_POOL_ID="us-west-2_ynufNQt7x"
CLIENT_ID="7ih19k48ijfnc6q4hbl24ctl7a"
USERNAME="agnathan@gmail.com"
PASSWORD='i3,fye8aA!'
AWS_REGION="us-west-2"

# Run this command to get the token
# It will print a JSON object. We need the IdToken from it.
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters USERNAME=$USERNAME,PASSWORD='i3\,fye8aA!' \
  --client-id $CLIENT_ID \
  --region $AWS_REGION
