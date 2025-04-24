// src/app/page.tsx
"use client"; // This makes it a Client Component

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/sandbox");
  }, [router]);

  return null;
}
