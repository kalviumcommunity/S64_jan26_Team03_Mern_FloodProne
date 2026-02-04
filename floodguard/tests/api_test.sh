#!/bin/bash
BASE_URL="http://localhost:3000/api"

echo "Testing FloodGuard API..."

# Helper function to check success
check_success() {
  echo "$1" | grep -q '"success":true'
  if [ $? -eq 0 ]; then
    echo "✅ Success"
  else
    echo "❌ Failed: $1"
    exit 1
  fi
}

# Generate unique suffix
SUFFIX=$(date +%s)

# 1. Locations
echo "Creating Location..."
LOC_RES=$(curl -s -X POST $BASE_URL/locations \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test District $SUFFIX\",\"latitude\":26.9124,\"longitude\":75.7873,\"riskLevel\":\"SAFE\"}")
check_success "$LOC_RES"

# Extract ID from the 'data' object. The response structure is {"success":true, "data": {"id": 123, ...}, ...}
# We need to be careful with parsing.
LOC_ID=$(echo $LOC_RES | grep -o '"id":[0-9]*' | head -1 | awk -F: '{print $2}')
echo "Location ID: $LOC_ID"

if [ -z "$LOC_ID" ]; then
  echo "Failed to create location. Exiting."
  exit 1
fi

echo "Listing Locations..."
LOC_LIST=$(curl -s $BASE_URL/locations)
check_success "$LOC_LIST"

echo "Getting Location Details..."
LOC_DET=$(curl -s $BASE_URL/locations/$LOC_ID)
check_success "$LOC_DET"

# 2. Users
echo "Creating User..."
USER_RES=$(curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"testuser${SUFFIX}@example.com\",\"name\":\"Test User\",\"locationId\":$LOC_ID}")
check_success "$USER_RES"
USER_ID=$(echo $USER_RES | grep -o '"id":[0-9]*' | head -1 | awk -F: '{print $2}')
echo "User ID: $USER_ID"

echo "Listing Users..."
USER_LIST=$(curl -s "$BASE_URL/users?page=1&limit=5")
check_success "$USER_LIST"

# 3. Alerts
echo "Creating Alert..."
ALERT_RES=$(curl -s -X POST $BASE_URL/alerts \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"FLOOD\",\"message\":\"Water level rising\",\"severity\":\"CRITICAL\",\"locationId\":$LOC_ID}")
check_success "$ALERT_RES"
ALERT_ID=$(echo $ALERT_RES | grep -o '"id":[0-9]*' | head -1 | awk -F: '{print $2}')
echo "Alert ID: $ALERT_ID"

echo "Fetching Alerts..."
ALERT_LIST=$(curl -s "$BASE_URL/alerts?locationId=$LOC_ID")
check_success "$ALERT_LIST"

# 4. Weather
echo "Fetching Weather..."
WEATHER_RES=$(curl -s "$BASE_URL/weather?lat=26.9124&lon=75.7873")
check_success "$WEATHER_RES"

# Clean up (Optional)
# echo "Deleting Alert..."
# curl -s -X DELETE $BASE_URL/alerts/$ALERT_ID
# echo "Deleting User..."
# curl -s -X DELETE $BASE_URL/users/$USER_ID
# echo "Deleting Location..."
# curl -s -X DELETE $BASE_URL/locations/$LOC_ID

echo "API Verification Complete!"
