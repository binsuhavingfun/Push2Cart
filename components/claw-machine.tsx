"use client";

import { useEffect, useRef, useState } from "react";

type RewardResult = {
  code: string;
  discountPercent: number;
  rarity: "common" | "rare";
};

const capsules = ["Speed", "Lucky", "Bonus", "Prime", "Flash", "Boost"];
const SWEEP_MIN_X = -120;
const SWEEP_MAX_X = 120;
const SWEEP_DURATION_MS = 1500;
const PRE_DROP_PAUSE_MS = 280;

export function ClawMachine({
  initialPlaysLeft,
  userId
}: {
  initialPlaysLeft: number;
  userId: string;
}) {
  const [phase, setPhase] = useState<"idle" | "sweep" | "drop" | "grab" | "shake" | "return">("idle");
  const [message, setMessage] = useState("Drop the claw and try your luck.");
  const [playsLeft, setPlaysLeft] = useState(initialPlaysLeft);
  const [loading, setLoading] = useState(false);
  const [clawOffset, setClawOffset] = useState(0);
  const sweepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRefs = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const queueTimeout = (callback: () => void, delay: number) => {
    const timeoutId = setTimeout(callback, delay);
    timeoutRefs.current.push(timeoutId);
  };

  const clearAnimationTimers = () => {
    if (sweepIntervalRef.current) {
      clearInterval(sweepIntervalRef.current);
      sweepIntervalRef.current = null;
    }

    timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutRefs.current = [];
  };

  useEffect(() => {
    return () => {
      clearAnimationTimers();
    };
  }, []);

  const randomSweepOffset = () =>
    Math.floor(Math.random() * (SWEEP_MAX_X - SWEEP_MIN_X + 1)) + SWEEP_MIN_X;

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

    queueTimeout(() => {
      void audioContext.close();
    }, Math.ceil(duration * 1000) + 80);
  };

  const playSequence = (type: "start" | "drop" | "lose" | "gameover") => {
    if (type === "start") {
      playTone(520);
      queueTimeout(() => playTone(660), 120);
      return;
    }

    if (type === "drop") {
      playTone(320, 0.16);
      return;
    }

    if (type === "lose") {
      playTone(280, 0.2);
      queueTimeout(() => playTone(220, 0.2), 160);
      return;
    }

    playTone(180, 0.35);
  };

  // Non-copyright custom generated arcade win sound.
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

    queueTimeout(() => {
      void audioContext.close();
    }, 900);
  };

  const clawTransformClass = (() => {
    if (phase === "drop") return "translate-y-52";
    if (phase === "grab" || phase === "shake") return "translate-y-52";
    return "translate-y-0";
  })();

  const handlePlay = async () => {
    if (playsLeft <= 0 || loading) {
      playSequence("gameover");
      return;
    }

    clearAnimationTimers();
    setLoading(true);
    setPhase("sweep");
    setMessage("Claw is scanning left and right...");
    playSequence("start");

    setClawOffset(randomSweepOffset());
    sweepIntervalRef.current = setInterval(() => {
      setClawOffset(randomSweepOffset());
    }, 360);

    queueTimeout(() => {
      if (sweepIntervalRef.current) {
        clearInterval(sweepIntervalRef.current);
        sweepIntervalRef.current = null;
      }

      setMessage("Target locked...");

      queueTimeout(() => {
        setPhase("drop");
        setMessage("Claw is dropping...");
        playSequence("drop");
      }, PRE_DROP_PAUSE_MS);
    }, SWEEP_DURATION_MS);

    queueTimeout(() => setPhase("grab"), SWEEP_DURATION_MS + PRE_DROP_PAUSE_MS + 520);
    queueTimeout(() => setPhase("shake"), SWEEP_DURATION_MS + PRE_DROP_PAUSE_MS + 900);
    queueTimeout(() => setPhase("return"), SWEEP_DURATION_MS + PRE_DROP_PAUSE_MS + 1280);

    const response = await fetch("/api/game/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId
      })
    });

    const payload = (await response.json()) as {
      error?: string;
      playsLeft?: number;
      didWin?: boolean;
      reward?: RewardResult | null;
    };

    queueTimeout(() => {
      if (!response.ok) {
        playSequence("lose");
        setMessage(payload.error ?? "Claw jammed. Try again soon.");
      } else if (payload.didWin && payload.reward) {
        const reward = payload.reward;
        playWinJingle();
        setMessage(
          `${reward.rarity === "rare" ? "Jackpot" : "Win"}: ${reward.discountPercent}% off with code ${reward.code}`
        );
      } else {
        playSequence("lose");
        setMessage("No reward this round. Try again on your next play.");
      }

      setPlaysLeft((current) => payload.playsLeft ?? Math.max(current - 1, 0));
      setPhase("idle");
      setClawOffset(0);
      setLoading(false);
    }, SWEEP_DURATION_MS + PRE_DROP_PAUSE_MS + 2100);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="pixel-border pixel-panel p-6">
        <p className="pixel-heading text-xs text-secondary">Push2Cart Arcade</p>
        <h2 className="pixel-heading mt-4 text-lg text-white">Drop Claw Challenge</h2>
        <div className="relative mt-8 h-[440px] overflow-hidden border-4 border-secondary bg-[linear-gradient(180deg,hsl(240_13%_17%),hsl(235_20%_9%))] shadow-[inset_0_0_0_4px_hsl(320_100%_50%/0.35)]">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_10%,hsl(0_0%_100%/0.16)_20%,transparent_32%)] animate-[pulse_2.2s_ease-in-out_infinite]" />
          <div className="absolute left-1/2 top-0 h-20 w-3 -translate-x-1/2 bg-secondary/80 shadow-[0_0_14px_hsl(180_100%_50%/0.7)]" />
          <div
            className={`absolute left-1/2 top-8 flex h-20 w-16 -translate-x-1/2 items-end justify-center transition-[transform,margin] duration-300 ease-in-out ${clawTransformClass} ${phase === "shake" ? "animate-[wiggle_0.18s_linear_4]" : ""}`}
            style={{ marginLeft: `${clawOffset}px` }}
          >
            <div className="relative h-12 w-12">
              <span className="absolute left-1/2 top-0 h-8 w-[2px] -translate-x-1/2 bg-white" />
              <span className="absolute bottom-0 left-2 h-6 w-[2px] rotate-[24deg] bg-white shadow-[0_0_8px_hsl(0_0%_100%/0.7)]" />
              <span className="absolute bottom-0 right-2 h-6 w-[2px] -rotate-[24deg] bg-white shadow-[0_0_8px_hsl(0_0%_100%/0.7)]" />
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
        </div>
      </div>
      <aside className="pixel-border pixel-border-yellow pixel-panel p-6">
        <p className="pixel-heading text-xs text-white">Claw Controls</p>
        <p className="mt-4 text-white/80">
          Each account gets 2 plays per day. Common wins grant 5-10% off and rare wins
          grant 20-50% off.
        </p>
        <div className="mt-6 border border-white/10 bg-background/50 px-4 py-4 text-sm text-white/80">
          Plays left today: <span className="font-semibold text-accent">{playsLeft}</span>
        </div>
        <button
          onClick={handlePlay}
          disabled={playsLeft <= 0 || loading}
          className="pixel-border mt-6 w-full px-4 py-4 text-xs disabled:opacity-60"
        >
          {loading ? "Dropping..." : "Drop Claw"}
        </button>
        <p className="mt-6 text-sm text-secondary">{message}</p>
        <p className="mt-3 text-xs text-white/60">
          Sound effects are generated in-browser with Web Audio.
        </p>
      </aside>
    </div>
  );
}
