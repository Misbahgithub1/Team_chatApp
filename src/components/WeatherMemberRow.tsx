

import { useCityTime } from "../hooks/useCityTime";

type Props = {
  username: string;
  city: string;
  country?: string | null;
  
  weather: {
    temperature: number | null;
    condition: string | null;
  };
};

export function WeatherMemberRow({
  username,
  city,
  country,
  weather,
}: Props) {
  const { time, status } = useCityTime(city, country ?? undefined);

  const temperature =
    typeof weather.temperature === "number"
      ? `${Math.round(weather.temperature)}°`
      : "—";

  let condition = "Loading weather…";
  if (weather.condition) {
    condition =
      weather.condition.charAt(0).toUpperCase() +
      weather.condition.slice(1);
  }
  
  if (weather.condition === null) {
    condition = "Unavailable";
  }

  let displayTime = "Loading…";
  if (status === "success" && time) {
    displayTime = new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } else if (status === "error") {
    displayTime = "Time unavailable";
  }

  return (
    <div className="weather-summary">
      <div>
        <div className="weather-summary__temp">{temperature}</div>
        <div className="weather-summary__meta" title={condition}>{condition}</div>
      </div>

      <div>
        <div className="weather-summary__meta weather-summary__meta--name">
          {username}
        </div>
        <div className="weather-summary__meta weather-summary__meta--location">
          {city}
          {country && (
            <span className="weather-summary__country"> · {country}</span>
          )}
          <span className="weather-summary__time"> · {displayTime}</span>
        </div>
      </div>
    </div>
  );
}
