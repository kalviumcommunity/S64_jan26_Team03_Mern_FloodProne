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

# Helper function to check validation failure
check_failure() {
  echo "$1" | grep -q '"success":false'
  if [ $? -eq 0 ]; then
    echo "✅ Success (Expected Failure)"
  else
    echo "❌ Failed (Expected Failure): $1"
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

# Extract ID from the 'data' object.
LOC_ID=$(echo $LOC_RES | grep -o '"id":[0-9]*' | head -1 | awk -F: '{print $2}')
echo "Location ID: $LOC_ID"

if [ -z "$LOC_ID" ]; then
  echo "Failed to create location. Exiting."
  exit 1
fi

echo "Creating Invalid Location (Validation Test)..."
INV_LOC=$(curl -s -X POST $BASE_URL/locations \
  -H "Content-Type: application/json" \
  -d '{"name":"A","latitude":200}')
echo "Response: $INV_LOC"
check_failure "$INV_LOC"
# Validate error message contains field error
echo "$INV_LOC" | grep -q "Name must be at least 2 characters long" || echo "❌ Missing Name Error"
echo "$INV_LOC" | grep -q "Latitude must be between -90 and 90" || echo "❌ Missing Lat Error"

# 2. Users
echo "Creating User..."
USER_RES=$(curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"testuser${SUFFIX}@example.com\",\"name\":\"Test User\",\"locationId\":$LOC_ID}")
check_success "$USER_RES"
USER_ID=$(echo $USER_RES | grep -o '"id":[0-9]*' | head -1 | awk -F: '{print $2}')
echo "User ID: $USER_ID"

echo "Creating Invalid User (Validation Test)..."
INV_USER=$(curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"not-an-email\",\"name\":\"A\"}")
echo "Response: $INV_USER"
check_failure "$INV_USER"
echo "$INV_USER" | grep -q "Invalid email address" || echo "❌ Missing Email Error"

# 3. Alerts
echo "Creating Alert..."
ALERT_RES=$(curl -s -X POST $BASE_URL/alerts \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"FLOOD\",\"message\":\"Water level rising\",\"severity\":\"CRITICAL\",\"locationId\":$LOC_ID}")
check_success "$ALERT_RES"

echo "Creating Invalid Alert (Validation Test)..."
INV_ALERT=$(curl -s -X POST $BASE_URL/alerts \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"INVALID_TYPE\",\"message\":\"Hi\"}")
echo "Response: $INV_ALERT"
check_failure "$INV_ALERT"
# Note: Zod returns "Invalid input" or similar for nativeEnum if value is invalid string.
# But if it's undefined (missing key), it says Required.
# With "INVALID_TYPE", it should be caught by z.nativeEnum validation.
echo "$INV_ALERT" | grep -q "Invalid option" || echo "❌ Missing Type Error"

# 4. PATCH Validation Tests
echo "Updating User with Invalid Data..."
INV_USER_UPD=$(curl -s -X PATCH $BASE_URL/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{"email":"bad-email"}')
echo "Response: $INV_USER_UPD"
check_failure "$INV_USER_UPD"
echo "$INV_USER_UPD" | grep -q "Invalid email address" || echo "❌ Missing Email Update Error"

echo "Updating Location with Invalid Data..."
INV_LOC_UPD=$(curl -s -X PATCH $BASE_URL/locations/$LOC_ID \
  -H "Content-Type: application/json" \
  -d '{"latitude": 200}')
echo "Response: $INV_LOC_UPD"
check_failure "$INV_LOC_UPD"
echo "$INV_LOC_UPD" | grep -q "Latitude must be" || echo "❌ Missing Latitude Update Error"

# 5. Weather
echo "Fetching Weather..."
WEATHER_RES=$(curl -s "$BASE_URL/weather?lat=26.9124&lon=75.7873")
check_success "$WEATHER_RES"

echo "API Verification Complete!"
