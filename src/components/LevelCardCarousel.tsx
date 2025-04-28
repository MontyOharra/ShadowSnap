"use client";

import React, { useState } from "react";
import LevelCard from "./LevelCard";
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
  const total = levels.length;
  const completedLevels = usePlayer((s) => s.completedLevels);
  const unlockedLevels = usePlayer((s) => s.unlockedLevels);
  const router = useRouter();

  // Always render three slots: left, center, right
  const leftIdx = centerIdx - 1;
  const rightIdx = centerIdx + 1;
  const indices = [leftIdx, centerIdx, rightIdx];

  const handlePrev = () => {
    setCenterIdx((prev) => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setCenterIdx((prev) => Math.min(total - 1, prev + 1));
  };

  return (
    <div className="h-[66vh] flex items-center justify-center w-full relative">
      {/* Left button */}
      <button
        onClick={handlePrev}
        className="absolute left-8 z-10 p-6 bg-white border-2 border-gray-300 rounded-full shadow-xl hover:bg-gray-200 disabled:opacity-40 text-5xl font-bold select-none transition-all duration-150"
        style={{ top: "50%", transform: "translateY(-50%)" }}
        aria-label="Previous"
        disabled={centerIdx === 0}
      >
        &#8592;
      </button>
      {/* Cards */}
      <div className="flex gap-12 justify-center items-center w-full h-full">
        {indices.map((idx, i) =>
          idx < 0 || idx >= total ? (
            // Placeholder for out-of-bounds
            <div key={i} className="w-[22vw] h-[90%] opacity-0" />
          ) : (
            <div
              key={levels[idx].id || idx}
              className="w-[22vw] h-[90%] flex items-center justify-center"
            >
              <LevelCard
                levelName={levels[idx].name}
                isLocked={!unlockedLevels.includes(levels[idx].id)}
                isComplete={completedLevels.includes(levels[idx].id)}
                isStarted={false}
                className={
                  "w-full h-full " + (idx !== centerIdx ? "opacity-80" : "")
                }
                onClick={() => router.push(`/puzzle/${levels[idx].id}`)}
              />
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
        disabled={centerIdx === total - 1}
      >
        &#8594;
      </button>
    </div>
  );
}
