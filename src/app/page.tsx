// src/app/page.tsx
"use client"; // This makes it a Client Component

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    // Check if it's the user's first visit
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");

    if (!hasVisitedBefore) {
      // If the user hasn't visited before, show the animation
      setTimeout(() => {
        setAnimationDone(true);
        localStorage.setItem("hasVisitedBefore", "true"); // Mark as visited
      }, 3000); // Animation duration (3 seconds)
    } else {
      // If the user has visited before, skip the animation and show the menu immediately
      setAnimationDone(true);
    }
  }, []);

  if (!animationDone) {
    return (
      <div className="animation-screen">
        {/* Animation logic */}
        <p>Loading animation...</p>
      </div>
    );
  }

  return (
    <div className="main-menu">
      <h1>Welcome to My App</h1>
      <nav>
        <ul>
          <li>
            <Link href="/settings/menu">Settings</Link>
          </li>
          <li>
            <Link href="/sandbox">Sandbox Mode</Link>
          </li>
          <li>
            <Link href="/puzzle/menu">Puzzle Mode</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
