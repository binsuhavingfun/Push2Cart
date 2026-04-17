import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type RewardPayload = {
  userId: string;
};

function generateReward() {
  const isWin = Math.random() < 0.72;
  if (!isWin) {
    return null;
  }

  const rare = Math.random() < 0.22;
  const discountPercent = rare
    ? 20 + Math.floor(Math.random() * 31)
    : 5 + Math.floor(Math.random() * 6);

  return {
    code: `P2C-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    discountPercent,
    rarity: rare ? "rare" : "common"
  };
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 500 }
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please log in to play." }, { status: 401 });
  }

  const payload = (await request.json()) as RewardPayload;

  if (payload.userId !== user.id) {
    return NextResponse.json({ error: "Invalid player session." }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: gamePlay } = await supabase
    .from("game_plays")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const currentPlays =
    gamePlay?.last_play_date === today ? Number(gamePlay.plays_today ?? 0) : 0;

  if (currentPlays >= 2) {
    return NextResponse.json({ error: "Daily limit reached." }, { status: 400 });
  }

  const nextPlays = currentPlays + 1;

  const { error: playError } = await supabase.from("game_plays").upsert(
    {
      user_id: user.id,
      plays_today: nextPlays,
      last_play_date: today
    },
    {
      onConflict: "user_id"
    }
  );

  if (playError) {
    return NextResponse.json({ error: playError.message }, { status: 500 });
  }

  const reward = generateReward();

  if (reward) {
    const { error: voucherError } = await supabase.from("vouchers").insert({
      user_id: user.id,
      code: reward.code,
      discount_percent: reward.discountPercent,
      is_used: false
    });

    if (voucherError) {
      return NextResponse.json({ error: voucherError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    playsLeft: Math.max(2 - nextPlays, 0),
    didWin: Boolean(reward),
    reward
  });
}
