import { loadEnvConfig } from "@next/env";

let loaded = false;

export function loadRuntimeEnv() {
  if (loaded) return;
  loadEnvConfig(process.cwd());
  loaded = true;
}

/** Bracket access avoids Next.js build-time inlining of secrets. */
export function runtimeEnv(key: string): string | undefined {
  loadRuntimeEnv();
  return process.env[key];
}

export function getAuthSecret(): string | undefined {
  return runtimeEnv("NEXTAUTH_SECRET") ?? runtimeEnv("AUTH_SECRET");
}
