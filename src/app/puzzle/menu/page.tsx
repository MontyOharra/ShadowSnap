// src/app/puzzle/menu/page.tsx
import fs from "fs";
import path from "path";
import Link from "next/link";
import LevelCardCarousel from "@/components/LevelCardCarousel";

// Helper to load all level JSON files
function getAllLevels() {
  const levelsDir = path.join(process.cwd(), "src/data/levels/base");
  const files = fs.readdirSync(levelsDir).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const filePath = path.join(levelsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return data;
  });
}

export default function PuzzleMenu() {
  const levels = getAllLevels();

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      {/* Back to menu button */}
      <Link
        href="/"
        className="absolute top-4 left-4 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-100 font-semibold z-20"
      >
        ← Back
      </Link>
      <h1 className="text-3xl font-bold mb-8 text-center">Select a Puzzle</h1>
      <div className="flex justify-center items-center w-full">
        <LevelCardCarousel levels={levels} />
      </div>
    </div>
  );
}
