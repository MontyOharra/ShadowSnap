"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import SandboxMode from "./SandboxMode";

export default function Sandbox() {
  return (
    <Suspense fallback={null}>
      <SandboxMode />
    </Suspense>
  );
}
