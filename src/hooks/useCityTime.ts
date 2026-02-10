import { useEffect, useState } from "react";

export function useCityTime(city: string, country?: string) {
  const [time, setTime] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!city) return;

    setStatus("loading");

    const controller = new AbortController();

    async function fetchTime() {
      try {
        // Step 1: Get city coordinates from geocoding API (OpenStreetMap)
        // Add User-Agent as per Nominatim usage policy
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
            city
          )}&country=${encodeURIComponent(country ?? "")}&format=json&limit=1`,
          { 
            signal: controller.signal,
            headers: {
              "User-Agent": "TeamChatApp/1.0" 
            }
          }
        );

        if (!geoRes.ok) throw new Error("Geocoding failed");

        const geo = await geoRes.json();

        if (!geo[0]) throw new Error("City not found");

        const { lat, lon } = geo[0];

        // Step 2: Use lat/lon to get local time from Open-Meteo
        // Open-Meteo automatically resolves timezone based on coordinates
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`,
          { signal: controller.signal }
        );

        if (!weatherRes.ok) throw new Error("Time API failed");

        const data = await weatherRes.json();

        // data.current_weather.time is in "YYYY-MM-DDTHH:mm" format (local time of the city)
        setTime(data.current_weather.time);
        setStatus("success");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Time fetch error:", err);
          setStatus("error");
        }
      }
    }

    fetchTime();

    return () => controller.abort();
  }, [city, country]);

  return { time, status };
}
