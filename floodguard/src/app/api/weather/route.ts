
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return sendError(
      "Latitude and Longitude are required",
      ERROR_CODES.VALIDATION_ERROR,
      400
    );
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,rain,surface_pressure`
    );
    
    if (!response.ok) {
        throw new Error("Failed to fetch from Open-Meteo");
    }

    const data = await response.json();
    return sendSuccess(data, "Weather data fetched successfully");
  } catch (error) {
    console.error("Error fetching weather:", error);
    return sendError(
      "Failed to fetch weather data",
      ERROR_CODES.EXTERNAL_API_ERROR,
      500,
      error
    );
  }
}
