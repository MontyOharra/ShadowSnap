// src/app/settings/page.tsx
import Link from "next/link";

export default function Settings() {
  return (
    <div>
      <h1>Settings</h1>
      <p>Here you can adjust your preferences.</p>
      <Link href="/">Back to Main Menu</Link>
    </div>
  );
}
