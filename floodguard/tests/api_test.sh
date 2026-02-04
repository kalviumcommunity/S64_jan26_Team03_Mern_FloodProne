#!/bin/bash
BASE_URL="http://localhost:3000/api"

echo "Testing FloodGuard API..."

# 1. Locations
echo "Creating Location..."
LOC=$(curl -s -X POST $BASE_URL/locations \
  -H "Content-Type: application/json" \
  -d '{"name":"Test District","latitude":26.9124,"longitude":75.7873,"riskLevel":"SAFE"}')
echo "Response: $LOC"
LOC_ID=$(echo $LOC | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Location ID: $LOC_ID"

if [ -z "$LOC_ID" ]; then
  echo "Failed to create location. Exiting."
  exit 1
fi

# 2. Users
echo "Creating User..."
curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test_$(date +%s)@example.com\",\"name\":\"Test User\",\"locationId\":$LOC_ID}"
echo ""

# 3. Alerts
echo "Creating Alert..."
curl -s -X POST $BASE_URL/alerts \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"HEAVY_RAIN\",\"message\":\"Heavy rain expected\",\"severity\":\"MODERATE\",\"locationId\":$LOC_ID}"
echo ""

# 4. Weather
echo "Fetching Weather..."
curl -s "$BASE_URL/weather?lat=26.9124&lon=75.7873"
echo ""

echo "Done."
