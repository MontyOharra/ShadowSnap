"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { usePlayer } from "@/stores/usePlayer";
import confetti from "canvas-confetti";

export default function LevelCompletePage() {
  const params = useParams<{ levelId: string }>();
  const levelId = params.levelId;
  const levelNumber = levelId ? levelId.split("_")[1] : "1";
  const nextLevelNumber = parseInt(levelNumber) + 1;
  const nextLevelId = `level_${nextLevelNumber}`;

  const isLevelUnlocked = usePlayer((state) =>
    state.isLevelUnlocked(nextLevelId)
  );

  // Launch confetti when page loads
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const runConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        disableForReducedMotion: true,
      });

      if (Date.now() < end) {
        requestAnimationFrame(runConfetti);
      }
    };

    runConfetti();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          Level Complete!
        </h1>

        <p className="text-xl text-gray-700 mb-8">
          Congratulations! You&apos;ve completed Level {levelNumber}
        </p>

        <div className="flex flex-col gap-4">
          {isLevelUnlocked && (
            <Link
              href={`/puzzle/${nextLevelId}`}
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-bold transition-colors"
            >
              Next Level
            </Link>
          )}

          <Link
            href={`/puzzle/${levelId}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-bold transition-colors"
          >
            Play Again
          </Link>

          <Link
            href="/puzzle/menu"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 font-bold transition-colors"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
