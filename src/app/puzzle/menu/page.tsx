// src/app/puzzle/menu/page.tsx
"use client"; // Mark as a Client Component

import Link from "next/link";

export default function PuzzleMenu() {
  return (
    <div>
      <h1>Select a Puzzle</h1>
      <nav>
        <ul>
          <li>
            <Link href="/puzzle/level1">Puzzle Level 1</Link>
          </li>
          <li>
            <Link href="/settings">Puzzle Level 2</Link>
          </li>
          {/* Add more puzzle levels here */}
        </ul>
      </nav>
    </div>
  );
}
