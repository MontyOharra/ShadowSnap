// src/app/page.tsx
"use client"; // This makes it a Client Component

import Link from "next/link";

export default function Home() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center space-y-12">
        {/* Logo */}
        <h1 className="text-6xl font-bold text-blue-800 tracking-wide drop-shadow-lg">
          ShadowSnap
        </h1>

        {/* Menu Buttons */}
        <div className="flex flex-col space-y-4">
          <Link
            href="/puzzle/menu"
            className="w-48 px-8 py-4 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Play
          </Link>
          <Link
            href="/sandbox/"
            className="w-48 px-8 py-4 text-xl font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            Sandbox
          </Link>
          <Link
            href="/settings"
            className="w-48 px-8 py-4 text-xl font-bold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-center"
          >
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
