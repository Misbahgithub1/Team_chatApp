import { useCityTime } from "./useCityTime";

type Member = {
  username: string;
  city: string;
  country?: string | null;
};

type MemberTime = {
  username: string;
  time: string | null;
  status: "loading" | "error" | "success";
};

export function useMembersTime(members: Member[]): MemberTime[] {
  return members.map(member => {
    const { time, status } = useCityTime(
      member.city,
      member.country ?? undefined // ✅ null → undefined
    );

    return {
      username: member.username,
      time,
      status,
    };
  });
}
