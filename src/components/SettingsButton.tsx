"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsButton() {
  const currentPath = usePathname();

  return (
    <Link
      href={`/settings?returnTo=${encodeURIComponent(currentPath)}`}
      className="fixed bottom-12 right-4 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-100 font-semibold z-20"
    >
      ⚙️ Settings
    </Link>
  );
} 