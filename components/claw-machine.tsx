"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type RewardResult = {
  code: string;
  discountPercent: number;
  rarity: "common" | "rare";
};

type Phase = "ready" | "dropping" | "grabbing" | "lifting" | "result";
type ConfettiPiece = {
  left: number;
  delayMs: number;
  durationMs: number;
  driftPx: number;
  rotationDeg: number;
  color: string;
};

const capsules = ["Speed", "Lucky", "Bonus", "Prime", "Flash", "Boost"];
const SWEEP_MIN_X = -120;
const SWEEP_MAX_X = 120;
const SWEEP_SPEED_PX_PER_SEC = 120;
const PRE_DROP_PAUSE_MS = 250;
const DROP_DURATION_MS = 700;
const GRAB_HOLD_MS = 420;
const LIFT_DURATION_MS = 700;
const RESULT_SHOW_MS = 1600;
const REWARD_REVEAL_DELAY_MS = 420;
const CONFETTI_COUNT = 22;
const BASE_CABLE_HEIGHT = 46;
const DROP_DEPTH = 210;
const CONFETTI_COLORS = ["#ff3d81", "#00e5ff", "#ffd600", "#7c4dff", "#3dff8c", "#ff8f3d"];

export function ClawMachine({
  initialPlaysLeft,
  userId
}: {
  initialPlaysLeft: number;
  userId: string;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [message, setMessage] = useState("Time your shot and drop the claw.");
  const [playsLeft, setPlaysLeft] = useState(initialPlaysLeft);
  const [loading, setLoading] = useState(false);
  const [clawOffset, setClawOffset] = useState(0);
  const [dropDepth, setDropDepth] = useState(0);
  const [revealedReward, setRevealedReward] = useState<RewardResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  const frameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const directionRef = useRef<1 | -1>(1);
  const offsetRef = useRef(0);
  const workflowTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const mountedRef = useRef(true);

  const clearWorkflowTimeouts = () => {
    workflowTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    workflowTimeoutsRef.current = [];
  };

  const buildConfettiPieces = () =>
    Array.from({ length: CONFETTI_COUNT }, () => ({
      left: Math.random() * 100,
      delayMs: Math.floor(Math.random() * 280),
      durationMs: 1100 + Math.floor(Math.random() * 850),
      driftPx: -90 + Math.random() * 180,
      rotationDeg: -280 + Math.random() * 560,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
    }));

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const timeoutId = setTimeout(resolve, ms);
      workflowTimeoutsRef.current.push(timeoutId);
    });

  const stopSweep = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    lastTimestampRef.current = null;
  };

  const startSweep = () => {
    stopSweep();

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaSec = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      let next = offsetRef.current + directionRef.current * SWEEP_SPEED_PX_PER_SEC * deltaSec;

      if (next >= SWEEP_MAX_X) {
        next = SWEEP_MAX_X;
        directionRef.current = -1;
      } else if (next <= SWEEP_MIN_X) {
        next = SWEEP_MIN_X;
        directionRef.current = 1;
      }

      offsetRef.current = next;
      setClawOffset(next);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSweep();
      clearWorkflowTimeouts();
    };
  }, []);

  useEffect(() => {
    const shouldSweep = phase === "ready" && !loading && playsLeft > 0;

    if (shouldSweep) {
      startSweep();
    } else {
      stopSweep();
    }

    return () => {
      if (!shouldSweep) {
        stopSweep();
      }
    };
  }, [phase, loading, playsLeft]);

  const playTone = (frequency: number, duration = 0.12, type: OscillatorType = "square") => {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    const audioContext = new AudioCtx();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.05;

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);

    setTimeout(() => {
      void audioContext.close();
    }, Math.ceil(duration * 1000) + 80);
  };

  const playSequence = (type: "button" | "drop" | "lose" | "gameover") => {
    if (type === "button") {
      playTone(520, 0.1);
      setTimeout(() => playTone(660, 0.1), 100);
      return;
    }

    if (type === "drop") {
      playTone(320, 0.16);
      return;
    }

    if (type === "lose") {
      playTone(280, 0.2);
      setTimeout(() => playTone(220, 0.2), 160);
      return;
    }

    playTone(180, 0.35);
  };

  // Non-copyright custom-generated arcade win jingle.
  const playWinJingle = () => {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    const audioContext = new AudioCtx();
    const now = audioContext.currentTime;
    const notes = [784, 988, 1175, 1568];

    notes.forEach((frequency, index) => {
      const start = now + index * 0.1;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.08, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(start);
      oscillator.stop(start + 0.16);
    });

    setTimeout(() => {
      void audioContext.close();
    }, 900);
  };

  const handleDropPress = async () => {
    if (loading || phase !== "ready") {
      return;
    }

    if (playsLeft <= 0) {
      playSequence("gameover");
      setMessage("No plays left today. Come back tomorrow.");
      return;
    }

    setLoading(true);
    setRevealedReward(null);
    setShowConfetti(false);
    setConfettiPieces([]);
    clearWorkflowTimeouts();
    playSequence("button");

    const responsePromise = fetch("/api/game/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId })
    });

    setPhase("dropping");
    setMessage("Carriage locked. Preparing drop...");

    await wait(PRE_DROP_PAUSE_MS);
    if (!mountedRef.current) return;

    playSequence("drop");
    setMessage("Claw descending...");
    setDropDepth(DROP_DEPTH);

    await wait(DROP_DURATION_MS);
    if (!mountedRef.current) return;

    setPhase("grabbing");
    setMessage("Claw grabbing capsule...");

    await wait(GRAB_HOLD_MS);
    if (!mountedRef.current) return;

    setPhase("lifting");
    setMessage("Lifting claw...");
    setDropDepth(0);

    await wait(LIFT_DURATION_MS);
    if (!mountedRef.current) return;

    const response = await responsePromise;
    const payload = (await response.json()) as {
      error?: string;
      playsLeft?: number;
      didWin?: boolean;
      reward?: RewardResult | null;
    };

    setPhase("result");

    if (!response.ok) {
      playSequence("lose");
      setMessage(payload.error ?? "Claw jammed. Try again soon.");
    } else if (payload.didWin && payload.reward) {
      const reward = payload.reward;
      setMessage("Claw secured something...");
      await wait(REWARD_REVEAL_DELAY_MS);
      if (!mountedRef.current) return;
      setRevealedReward(reward);
      setConfettiPieces(buildConfettiPieces());
      setShowConfetti(true);
      playWinJingle();
      setMessage(
        `${reward.rarity === "rare" ? "Jackpot" : "Win"}: ${reward.discountPercent}% off with code ${reward.code}`
      );
    } else {
      playSequence("lose");
      setMessage("No reward this round. Try again on your next play.");
    }

    setPlaysLeft((current) => payload.playsLeft ?? Math.max(current - 1, 0));

    await wait(RESULT_SHOW_MS);
    if (!mountedRef.current) return;

    setPhase("ready");
    setMessage("Time your shot and drop the claw.");
    setRevealedReward(null);
    setShowConfetti(false);
    setConfettiPieces([]);
    setLoading(false);
  };

  const phaseLabel =
    phase === "ready"
      ? "Ready"
      : phase === "dropping"
        ? "Dropping"
        : phase === "grabbing"
          ? "Grabbing"
          : phase === "lifting"
            ? "Lifting"
            : "Result";

  return (
    <div className="grid gap-4 lg:gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="pixel-border pixel-panel p-4 sm:p-6">
        <p className="pixel-heading text-xs text-secondary">Push2Cart Arcade</p>
        <h2 className="pixel-heading mt-4 text-lg text-white">Drop Claw Challenge</h2>
        <div className="relative mt-4 sm:mt-8 h-[52vh] min-h-[290px] max-h-[380px] sm:h-[440px] sm:max-h-none overflow-hidden border-4 border-secondary bg-[linear-gradient(180deg,hsl(240_13%_17%),hsl(235_20%_9%))] shadow-[inset_0_0_0_4px_hsl(320_100%_50%/0.35)]">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_10%,hsl(0_0%_100%/0.16)_20%,transparent_32%)] animate-[pulse_2.2s_ease-in-out_infinite]" />
          <div className="absolute inset-x-8 top-5 h-3 border border-secondary/50 bg-background/70" />

          <div
            className="absolute left-1/2 top-8 -translate-x-1/2 transition-[margin-left] duration-150 ease-linear"
            style={{ marginLeft: `${clawOffset}px` }}
          >
            <div className="flex flex-col items-center">
              <div className="h-5 w-14 border border-secondary/80 bg-secondary/30 shadow-[0_0_10px_hsl(180_100%_50%/0.35)]" />
              <div
                className="w-[2px] bg-white/90 transition-[height] duration-700 ease-in-out"
                style={{ height: `${BASE_CABLE_HEIGHT + dropDepth}px` }}
              />
              <div className={`relative h-12 w-12 ${phase === "grabbing" ? "animate-[wiggle_0.18s_linear_3]" : ""}`}>
                <span className="absolute left-1/2 top-0 h-8 w-[2px] -translate-x-1/2 bg-white" />
                <span className="absolute bottom-0 left-2 h-6 w-[2px] rotate-[24deg] bg-white shadow-[0_0_8px_hsl(0_0%_100%/0.7)]" />
                <span className="absolute bottom-0 right-2 h-6 w-[2px] -rotate-[24deg] bg-white shadow-[0_0_8px_hsl(0_0%_100%/0.7)]" />
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-5 grid grid-cols-3 gap-4 px-6">
            {capsules.map((capsule, index) => (
              <div
                key={capsule}
                className={`relative flex h-20 items-center justify-center rounded-full border-2 border-accent text-center text-[10px] uppercase tracking-[0.18em] text-white shadow-[0_10px_18px_hsl(240_40%_4%/0.7)] ${
                  index % 2 === 0 ? "bg-accent/20" : "bg-primary/25"
                }`}
              >
                <span className="absolute left-3 top-3 h-3 w-3 rounded-full bg-white/70" />
                {capsule}
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-8 bg-black/30" />
          {showConfetti ? (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {confettiPieces.map((piece, index) => (
                <span
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className="absolute top-0 block h-2 w-2 rounded-sm confetti-piece"
                  style={
                    {
                      left: `${piece.left}%`,
                      backgroundColor: piece.color,
                      "--confetti-duration": `${piece.durationMs}ms`,
                      "--confetti-delay": `${piece.delayMs}ms`,
                      "--confetti-drift": `${piece.driftPx}px`,
                      "--confetti-rotate": `${piece.rotationDeg}deg`
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 space-y-3 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-white/10 bg-background/50 px-3 py-2 text-xs text-white/80">
              Plays left: <span className="font-semibold text-accent">{playsLeft}</span>
            </div>
            <div className="border border-secondary/40 bg-secondary/10 px-3 py-2 text-xs uppercase tracking-[0.12em] text-secondary">
              State: {phaseLabel}
            </div>
          </div>

          <button
            onClick={handleDropPress}
            disabled={playsLeft <= 0 || loading || phase !== "ready"}
            className="pixel-border w-full px-4 py-3 text-sm disabled:opacity-60"
          >
            {loading ? "Running..." : "Drop Claw"}
          </button>

          <p className="text-sm text-secondary">{message}</p>
          {revealedReward ? (
            <div className="border border-accent/40 bg-accent/15 px-4 py-3 text-sm text-white">
              Reward Revealed: {revealedReward.discountPercent}% off ({revealedReward.code})
            </div>
          ) : null}
        </div>
      </div>

      <aside className="hidden lg:block pixel-border pixel-border-yellow pixel-panel p-6">
        <p className="pixel-heading text-xs text-white">Claw Controls</p>
        <p className="mt-4 text-white/80">
          Each account gets 2 plays per day. Time your drop to feel like a real arcade claw.
        </p>

        <div className="mt-6 border border-white/10 bg-background/50 px-4 py-4 text-sm text-white/80">
          Plays left today: <span className="font-semibold text-accent">{playsLeft}</span>
        </div>

        <div className="mt-3 border border-secondary/40 bg-secondary/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-secondary">
          State: {phaseLabel}
        </div>

        <button
          onClick={handleDropPress}
          disabled={playsLeft <= 0 || loading || phase !== "ready"}
          className="pixel-border mt-6 w-full px-4 py-4 text-sm disabled:opacity-60"
        >
          {loading ? "Running..." : "Drop Claw"}
        </button>

        <p className="mt-6 text-sm text-secondary">{message}</p>
        {revealedReward ? (
          <div className="mt-4 border border-accent/40 bg-accent/15 px-4 py-3 text-sm text-white">
            Reward Revealed: {revealedReward.discountPercent}% off ({revealedReward.code})
          </div>
        ) : null}
        <p className="mt-3 text-xs text-white/60">Sound effects are generated in-browser with Web Audio.</p>
      </aside>
      <style jsx>{`
        .confetti-piece {
          animation: confetti-fall var(--confetti-duration) ease-out var(--confetti-delay) forwards;
        }

        @keyframes confetti-fall {
          0% {
            transform: translate3d(0, -12px, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--confetti-drift), 390px, 0) rotate(var(--confetti-rotate));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
