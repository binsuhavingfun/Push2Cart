import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type RewardPayload = {
  userId?: string;
  targetCapsule?: string;
};

type GameApiResponse = {
  success: boolean;
  won: boolean;
  playsLeft: number;
  voucher?: {
    id: string;
    code: string;
    label: string;
    discountPercent: number;
  };
  message?: string;
  error?: string;
};

const CAPSULE_PROFILES = {
  Yizz: {
    winChance: 0.75,
    rareChance: 0.2,
    commonMin: 5,
    commonMax: 9,
    rareMin: 18,
    rareMax: 28
  },
  Nux: {
    winChance: 0.78,
    rareChance: 0.28,
    commonMin: 6,
    commonMax: 10,
    rareMin: 20,
    rareMax: 35
  },
  Lucky: {
    winChance: 0.72,
    rareChance: 0.22,
    commonMin: 5,
    commonMax: 11,
    rareMin: 20,
    rareMax: 30
  },
  GG: {
    winChance: 0.68,
    rareChance: 0.3,
    commonMin: 7,
    commonMax: 12,
    rareMin: 22,
    rareMax: 40
  },
  "67": {
    winChance: 0.7,
    rareChance: 0.18,
    commonMin: 5,
    commonMax: 10,
    rareMin: 18,
    rareMax: 26
  },
  Sheesh: {
    winChance: 0.66,
    rareChance: 0.25,
    commonMin: 8,
    commonMax: 12,
    rareMin: 24,
    rareMax: 42
  }
} as const;

type CapsuleName = keyof typeof CAPSULE_PROFILES;

const CAPSULE_NAMES = Object.keys(CAPSULE_PROFILES) as CapsuleName[];

function randomBetween(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function normalizeCapsule(value?: string): CapsuleName {
  if (!value) {
    return "Nux";
  }

  const found = CAPSULE_NAMES.find(
    (capsule) => capsule.toLowerCase() === value.trim().toLowerCase()
  );

  return found ?? "Nux";
}

function generateReward(targetCapsule?: string) {
  const capsuleName = normalizeCapsule(targetCapsule);
  const profile = CAPSULE_PROFILES[capsuleName];

  const isWin = Math.random() < profile.winChance;
  if (!isWin) {
    return null;
  }

  const rare = Math.random() < profile.rareChance;
  const discountPercent = rare
    ? randomBetween(profile.rareMin, profile.rareMax)
    : randomBetween(profile.commonMin, profile.commonMax);

  return {
    code: `P2C-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    discountPercent,
    rarity: rare ? "rare" : "common",
    capsuleName,
    rewardLabel: `${discountPercent}% Off ${capsuleName} Voucher`
  };
}

function jsonResponse(body: GameApiResponse, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();

    if (!supabase) {
      return jsonResponse(
        {
          success: false,
          won: false,
          playsLeft: 0,
          error: "Supabase environment variables are missing."
        },
        500
      );
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonResponse(
        {
          success: false,
          won: false,
          playsLeft: 0,
          error: "Please log in to play."
        },
        401
      );
    }

    if (await isAdminUser(supabase, user.id)) {
      return jsonResponse(
        {
          success: false,
          won: false,
          playsLeft: 0,
          error: "Admin accounts cannot use customer mini-game rewards."
        },
        403
      );
    }

    const rateLimitResponse = await enforceRateLimit({
      request,
      scope: "game:play",
      limit: 12,
      windowSeconds: 3600,
      userId: user.id,
      message: "Too many game requests were sent. Please slow down and try again shortly."
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const payload = (await request.json()) as RewardPayload;

    if (payload.userId && payload.userId !== user.id) {
      return jsonResponse(
        {
          success: false,
          won: false,
          playsLeft: 0,
          error: "Invalid player session."
        },
        403
      );
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data: gamePlay, error: gamePlayError } = await supabase
      .from("game_plays")
      .select("plays_today, last_play_date")
      .eq("user_id", user.id)
      .maybeSingle();

    if (gamePlayError) {
      return jsonResponse(
        {
          success: false,
          won: false,
          playsLeft: 0,
          error: "Unable to load your game status right now."
        },
        500
      );
    }

    const currentPlays =
      gamePlay?.last_play_date === today ? Number(gamePlay.plays_today ?? 0) : 0;

    if (currentPlays >= 2) {
      return jsonResponse(
        {
          success: false,
          won: false,
          playsLeft: 0,
          error: "Daily limit reached."
        },
        400
      );
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
      return jsonResponse(
        {
          success: false,
          won: false,
          playsLeft: Math.max(2 - currentPlays, 0),
          error: "Unable to record this play right now."
        },
        500
      );
    }

    const reward = generateReward(payload.targetCapsule);

    if (reward) {
      const { data: voucherRow, error: voucherError } = await supabase
        .from("vouchers")
        .insert({
          user_id: user.id,
          code: reward.code,
          discount_percent: reward.discountPercent,
          is_used: false
        })
        .select("id, code, discount_percent")
        .single();

      if (voucherError || !voucherRow) {
        return jsonResponse(
          {
            success: false,
            won: false,
            playsLeft: Math.max(2 - nextPlays, 0),
            error: "Your play was recorded, but the reward could not be saved."
          },
          500
        );
      }

      return jsonResponse({
        success: true,
        won: true,
        playsLeft: Math.max(2 - nextPlays, 0),
        voucher: {
          id: voucherRow.id,
          code: voucherRow.code,
          label: reward.rewardLabel,
          discountPercent: voucherRow.discount_percent
        },
        message: `Win: ${reward.discountPercent}% off with code ${reward.code}`
      });
    }

    return jsonResponse({
      success: true,
      won: false,
      playsLeft: Math.max(2 - nextPlays, 0),
      message: "No reward this round. Try again on your next play."
    });
  } catch {
    return jsonResponse(
      {
        success: false,
        won: false,
        playsLeft: 0,
        error: "The claw machine request could not be completed."
      },
      500
    );
  }
}
