import React from "react";

interface LevelCardProps {
  levelName: string;
  isLocked: boolean;
  isComplete: boolean;
  isStarted: boolean;
  className?: string;
  onClick?: () => void;
}

export default function LevelCard({
  levelName,
  isLocked,
  isComplete,
  isStarted,
  className = "",
  onClick,
}: LevelCardProps) {
  return (
    <button
      type="button"
      onClick={isLocked ? undefined : onClick}
      className={`relative flex flex-col items-center rounded-xl border-2 border-gray-300 bg-white shadow-md transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400 ${
        isLocked
          ? "opacity-60 cursor-not-allowed"
          : "hover:shadow-lg cursor-pointer"
      } ${className}`}
      tabIndex={isLocked ? -1 : 0}
      aria-disabled={isLocked}
      disabled={isLocked}
    >
      {/* Image placeholder */}
      <div className="w-full h-3/4 mt-2 px-6 bg-gray-200 rounded-md flex items-center justify-center text-3xl text-gray-400">
        {/* You can put an image or icon here */}
      </div>
      {/* Level name */}
      <div className="flex-1 flex items-center justify-center w-full">
        <span className="text-2xl font-bold text-center w-full px-2">
          {levelName}
        </span>
      </div>
      {/* Status badges */}
      {isComplete && (
        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
          ✓
        </div>
      )}
      {isStarted && !isComplete && (
        <div className="absolute top-2 left-2 bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
          •
        </div>
      )}
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
          <span className="text-white text-xl font-bold">🔒</span>
        </div>
      )}
    </button>
  );
}
