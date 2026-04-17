import { ClawMachine } from "@/components/claw-machine";
import { SectionHeading } from "@/components/section-heading";
import { requireUser } from "@/lib/auth";

export default async function GamePage() {
  const { supabase, user } = await requireUser("/game");

  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("game_plays")
    .select("plays_today, last_play_date")
    .eq("user_id", user.id)
    .maybeSingle();

  const playsToday = data?.last_play_date === today ? data.plays_today : 0;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Mini Game"
        title="Claw Machine Bonus Round"
        description="Sign in to use your daily plays, drop the claw, and earn account-bound vouchers for your next checkout."
      />
      <ClawMachine userId={user.id} initialPlaysLeft={Math.max(2 - playsToday, 0)} />
    </div>
  );
}
