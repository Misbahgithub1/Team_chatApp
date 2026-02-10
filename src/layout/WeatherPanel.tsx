import { WeatherMemberRow } from "../components/WeatherMemberRow";
import { useTeamWeather } from "../hooks/useTeamWeather";


type WeatherPanelProps = {
  roomId: string;
};

export function WeatherPanel({ roomId }: WeatherPanelProps) {
  const { members, status, error } = useTeamWeather({ roomId });

  const isLoading = status === "loading";
  const hasError = status === "error";

  // Defensive: Deduplicate members by ID to prevent key collisions
  const uniqueMembers = members.filter(
    (member, index, self) =>
      index === self.findIndex((m) => m.id === member.id)
  );

  return (
    <div className="layout-panel layout-panel--weather">
      <header className="layout-panel__header">
        <h2 className="layout-panel__title">Team Weather</h2>
      </header>

      <div className="layout-panel__body">
        {uniqueMembers.map((member, index) => (
          <WeatherMemberRow
            key={member.id || `${member.username}-${index}`}
            username={member.username}
            city={member.city}
            country={member.country}
            weather={member.weather ?? { temperature: null, condition: null }}
          />
        ))}

        {isLoading && members.length === 0 && (
          <div className="weather-summary">
            Loading team weather…
          </div>
        )}

        {hasError && members.length === 0 && (
          <div className="weather-summary">{error}</div>
        )}
      </div>
    </div>
  );
}
