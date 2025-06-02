import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Cache duration in seconds (1 hour)
const CACHE_DURATION = 3600;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ error: "method_not_allowed", reason: "Method not allowed" });
  }

  const { lat, lng, type } = req.query;

  if (!lat || !lng || !type) {
    return res
      .status(400)
      .json({ error: "missing_params", reason: "Missing required parameters" });
  }

  // Round lat/lng to 3 decimals for cache key
  const latR = Number.parseFloat(lat).toFixed(3);
  const lngR = Number.parseFloat(lng).toFixed(3);
  const cacheKey = `weather:${type}:${latR}:${lngR}`;

  try {
    // Try to get cached data
    const cached = await redis.get(cacheKey);
    if (cached) {
      // If Redis returns a string, parse it
      const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
      return res.status(200).json(parsed);
    }

    let result;
    if (type === "wave") {
      // Stormglass: get waveHeight (meters)
      const sgRes = await fetch(
        `https://api.stormglass.io/v2/weather/point?lat=${latR}&lng=${lngR}&params=waveHeight`,
        {
          headers: {
            Authorization: process.env.STORMGLASS_API_KEY,
            Accept: "application/json",
          },
        }
      );
      if (!sgRes.ok) {
        return res.status(502).json({
          error: "stormglass_error",
          reason: `Stormglass API error: ${sgRes.status}`,
        });
      }
      const sgData = await sgRes.json();
      // Find the first available waveHeight value
      let wave = null;
      if (
        sgData.hours &&
        Array.isArray(sgData.hours) &&
        sgData.hours.length > 0
      ) {
        const h = sgData.hours[0];
        // Try to get the average of all sources, fallback to any
        if (h.waveHeight) {
          const vals = Object.values(h.waveHeight).filter(
            (v) => typeof v === "number"
          );
          if (vals.length > 0) {
            wave = vals.reduce((a, b) => a + b, 0) / vals.length;
          }
        }
      }
      result = { wave }; // meters, may be null
    } else if (type === "wind") {
      // Open-Meteo: get wind_speed_10m, wind_gusts_10m (knots)
      const omRes = await fetch(
        `https://customer-api.open-meteo.com/v1/forecast?latitude=${latR}&longitude=${lngR}&current=wind_speed_10m,wind_gusts_10m&windspeed_unit=kn&apikey=${process.env.OPEN_METEO_API_KEY}`
      );
      if (!omRes.ok) {
        return res.status(502).json({
          error: "openmeteo_error",
          reason: `Open-Meteo API error: ${omRes.status}`,
        });
      }
      const omData = await omRes.json();
      let wind = null,
        gust = null;
      if (omData.current) {
        wind = omData.current.wind_speed_10m ?? null;
        gust = omData.current.wind_gusts_10m ?? null;
      }
      result = { wind, gust }; // knots, may be null
    } else {
      return res
        .status(400)
        .json({ error: "invalid_type", reason: "Invalid weather type" });
    }

    // Cache as string
    await redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_DURATION });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Weather API error:", error);
    // Log more details
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      env: {
        hasStormglassKey: !!process.env.STORMGLASS_API_KEY,
        hasOpenMeteoKey: !!process.env.OPEN_METEO_API_KEY,
        hasRedisUrl: !!process.env.KV_REST_API_URL,
        hasRedisToken: !!process.env.KV_REST_API_TOKEN,
      },
    });
    return res
      .status(500)
      .json({
        error: "internal_error",
        reason: error.message || "Failed to fetch weather data",
      });
  }
}
