#!/bin/bash

# --- START OF SCRIPT ---
# 1. Get the correct URL from Terraform output
WEBSOCKET_URL="wss://rhg1v4xrlh.execute-api.us-west-2.amazonaws.com/prod"
if [ -z "$WEBSOCKET_URL" ]; then
    echo "Error: Could not get websocket_endpoint from terraform output."
    exit 1
fi

# 2. Convert wss:// to https:// for curl
HTTPS_URL=$(echo "$WEBSOCKET_URL" | sed 's/^wss:/https:/')

# 3. Get a fresh ID Token
# (You should replace this with your actual method of getting a token)
echo "Getting new Cognito Token..."
ID_TOKEN=$(aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=agnathan@gmail.com,PASSWORD='i3\,fye8aA!' --client-id 7ih19k48ijfnc6q4hbl24ctl7a --region us-west-2 --query "AuthenticationResult.IdToken" --output text)
if [ -z "$ID_TOKEN" ]; then
    echo "Error: Failed to get Cognito ID token."
    exit 1
fi

echo "--- Connecting to correct URL: $HTTPS_URL ---"

# 4. Run curl with the correct variables
curl -v -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
  -H "Sec-WebSocket-Version: 13" \
  "${HTTPS_URL}?Auth=${ID_TOKEN}"
