"use client";

import React, { useState } from "react";
import LevelCard from "./LevelCard";
import ImportLevelCard from "./ImportLevelCard";
import { usePlayer } from "@/stores/usePlayer";
import { useRouter } from "next/navigation";

interface Level {
  id: string;
  name: string;
}

interface LevelCardCarouselProps {
  levels: Level[];
}

export default function LevelCardCarousel({ levels }: LevelCardCarouselProps) {
  const [centerIdx, setCenterIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  // Add one more for the import card
  const total = levels.length + 1;
  const completedLevels = usePlayer((s) => s.completedLevels);
  const unlockedLevels = usePlayer((s) => s.unlockedLevels);
  const router = useRouter();

  // Show more cards to handle edge cases
  const leftIdx = centerIdx - 2;
  const rightIdx = centerIdx + 2;
  const indices = [leftIdx, centerIdx - 1, centerIdx, centerIdx + 1, rightIdx];

  const handlePrev = () => {
    if (isAnimating || centerIdx === 0) return;
    setIsAnimating(true);
    setDirection("right");
    setTimeout(() => {
      setCenterIdx((prev) => Math.max(0, prev - 1));
      setTimeout(() => {
        setIsAnimating(false);
        setDirection(null);
      }, 50);
    }, 500);
  };

  const handleNext = () => {
    if (isAnimating || centerIdx === total - 1) return;
    setIsAnimating(true);
    setDirection("left");
    setTimeout(() => {
      setCenterIdx((prev) => Math.min(total - 1, prev + 1));
      setTimeout(() => {
        setIsAnimating(false);
        setDirection(null);
      }, 50);
    }, 500);
  };

  // Render either a level card or the import card
  const renderCard = (idx: number) => {
    // If it's the last index, render the import card
    if (idx === levels.length) {
      return (
        <ImportLevelCard
          className={`w-full h-full transition-all duration-500 ${
            idx !== centerIdx ? "opacity-80" : ""
          }`}
        />
      );
    }

    // Otherwise render a regular level card
    return (
      <LevelCard
        levelName={levels[idx].name}
        isLocked={!unlockedLevels.includes(levels[idx].id)}
        isComplete={completedLevels.includes(levels[idx].id)}
        isStarted={false}
        className={`w-full h-full transition-all duration-500 ${
          idx !== centerIdx ? "opacity-80" : ""
        }`}
        onClick={() => router.push(`/puzzle/${levels[idx].id}`)}
      />
    );
  };

  return (
    <div className="h-[66vh] flex items-center justify-center w-full relative overflow-hidden">
      {/* Left button */}
      <button
        onClick={handlePrev}
        className="absolute left-8 z-10 p-6 bg-white border-2 border-gray-300 rounded-full shadow-xl hover:bg-gray-200 disabled:opacity-40 text-5xl font-bold select-none transition-all duration-150"
        style={{ top: "50%", transform: "translateY(-50%)" }}
        aria-label="Previous"
        disabled={centerIdx === 0 || isAnimating}
      >
        &#8592;
      </button>
      {/* Cards container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {indices.map((idx) =>
          idx < 0 || idx >= total ? null : (
            <div
              key={idx >= levels.length ? "import_card" : levels[idx].id || idx}
              className={`absolute w-[22vw] h-[90%] flex items-center justify-center transition-all duration-500 ease-in-out ${
                idx === centerIdx ? "scale-100 z-10" : "scale-90 z-0"
              }`}
              style={{
                transform: `translateX(${
                  idx === centerIdx
                    ? "0"
                    : idx < centerIdx
                    ? direction === "right"
                      ? `-${34 * (centerIdx - idx)}vw`
                      : `-${34 * (centerIdx - idx)}vw`
                    : direction === "left"
                    ? `${34 * (idx - centerIdx)}vw`
                    : `${34 * (idx - centerIdx)}vw`
                })`,
                left: "50%",
                marginLeft: idx === centerIdx ? "-11vw" : "-11vw",
              }}
            >
              {renderCard(idx)}
            </div>
          )
        )}
      </div>
      {/* Right button */}
      <button
        onClick={handleNext}
        className="absolute right-8 z-10 p-6 bg-white border-2 border-gray-300 rounded-full shadow-xl hover:bg-gray-200 disabled:opacity-40 text-5xl font-bold select-none transition-all duration-150"
        style={{ top: "50%", transform: "translateY(-50%)" }}
        aria-label="Next"
        disabled={centerIdx === total - 1 || isAnimating}
      >
        &#8594;
      </button>
    </div>
  );
}
