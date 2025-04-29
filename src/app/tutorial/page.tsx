"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Tutorial() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/puzzle/menu";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">How to Play</h1>
          <Link
            href={returnTo}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-100 font-semibold"
          >
            ← Back
          </Link>
        </div>

        {/* Basic Instructions */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Basic Controls
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="bg-gray-200 px-2 py-1 rounded mr-2">WASD</span>
                <span>Move selected piece</span>
              </li>
              <li className="flex items-center">
                <span className="bg-gray-200 px-2 py-1 rounded mr-2">Q</span>
                <span>Rotate selected piece</span>
              </li>
              <li className="flex items-center">
                <span className="bg-gray-200 px-2 py-1 rounded mr-2">
                  Space
                </span>
                <span>Select new piece</span>
              </li>
              <li className="flex items-center">
                <span className="bg-gray-200 px-2 py-1 rounded mr-2">P</span>
                <span>Place selected piece</span>
              </li>
              <li className="flex items-center">
                <span className="bg-gray-200 px-2 py-1 rounded mr-2">
                  Mouse
                </span>
                <span>Rotate camera view</span>
              </li>
              <li className="flex items-center">
                <span className="bg-gray-200 px-2 py-1 rounded mr-2">
                  Scroll
                </span>
                <span>Zoom in/out</span>
              </li>
              <li className="flex items-center">
                <span className="bg-gray-200 px-2 py-1 rounded mr-2">
                  Backspace
                </span>
                <span>Delete Piece</span>
              </li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Tips
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li>
                • Switch between User and Target views to compare your build
              </li>
              <li>• Use the base plate rotation to get better angles</li>
              <li>• Press Escape to cancel piece selection</li>
              <li>
                • Click on a piece to select it for moving or deleting. Only
                pieces that are not under another piece can be selected.
              </li>
              <li>
                • Pieces will always be snapped to the grid and placed on the highest piece currently on the board in that location.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
