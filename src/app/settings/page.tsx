// src/app/settings/page.tsx
"use client";

import Link from "next/link";
import { usePlayer } from "@/stores/usePlayer";
import { useSearchParams } from "next/navigation";

export default function Settings() {
  const settings = usePlayer((state) => state.settings);
  const setSetting = usePlayer((state) => state.setSetting);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <Link
            href={returnTo}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-100 font-semibold"
          >
            ← Back
          </Link>
        </div>

        {/* Settings Content */}
        <div className="space-y-4">
          {/* Audio Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Audio Settings</h2>
            
            {/* Master Volume */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-gray-700">Master Volume</label>
                <span className="text-gray-500">{settings.masterVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.masterVolume}
                onChange={(e) => setSetting("masterVolume", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Music Volume */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-gray-700">Music Volume</label>
                <span className="text-gray-500">{settings.musicVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume}
                onChange={(e) => setSetting("musicVolume", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Sound Effects</label>
              <button
                onClick={() => setSetting("sound", !settings.sound)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  settings.sound
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {settings.sound ? "On" : "Off"}
              </button>
            </div>

            {/* Music Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Background Music</label>
              <button
                onClick={() => setSetting("music", !settings.music)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  settings.music
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {settings.music ? "On" : "Off"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
