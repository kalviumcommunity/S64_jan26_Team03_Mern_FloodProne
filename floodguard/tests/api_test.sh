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
# 2. Users (via Admin/Public Route - assuming this still works but requires password)
echo "Creating User (via POST /api/users)..."
# Note: Password is now required by schema
USER_RES=$(curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"testuser${SUFFIX}@example.com\",\"name\":\"Test User\",\"password\":\"password123\",\"locationId\":$LOC_ID}")
check_success "$USER_RES"
USER_ID=$(echo $USER_RES | grep -o '"id":[0-9]*' | head -1 | awk -F: '{print $2}')
echo "User ID: $USER_ID"

echo "Creating Invalid User (Validation Test)..."
INV_USER=$(curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"not-an-email\",\"name\":\"A\",\"password\":\"123\"}")
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

# 5. Authentication Flow
echo "Testing Authentication..."

# Signup
echo "Signing up new user..."
SIGNUP_EMAIL="authuser${SUFFIX}@example.com"
SIGNUP_RES=$(curl -s -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$SIGNUP_EMAIL\",\"name\":\"Auth User\",\"password\":\"securepass\",\"locationId\":$LOC_ID}")
check_success "$SIGNUP_RES"

# Login
echo "Logging in..."
LOGIN_RES=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$SIGNUP_EMAIL\",\"password\":\"securepass\"}")
check_success "$LOGIN_RES"

# Extract Token
TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//')
echo "Token: ${TOKEN:0:20}..."

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to extract token"
  exit 1
fi

# Protected Route (GET /api/users) - Success
echo "Accessing Protected Route (with token)..."
PROTECTED_RES=$(curl -s -X GET $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN")
check_success "$PROTECTED_RES"

# Protected Route (GET /api/users) - Failure
echo "Accessing Protected Route (without token)..."
UNAUTH_RES=$(curl -s -X GET $BASE_URL/users)
echo "Response: $UNAUTH_RES"
check_failure "$UNAUTH_RES"
echo "$UNAUTH_RES" | grep -q "Token missing" || echo "❌ Expected 'Token missing' error"

# 6. Weather
echo "Fetching Weather..."
WEATHER_RES=$(curl -s "$BASE_URL/weather?lat=26.9124&lon=75.7873")
check_success "$WEATHER_RES"

echo "API Verification Complete!"
