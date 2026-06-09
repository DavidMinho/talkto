import { loadEnvConfig } from "@next/env";
import fs from "fs";
import path from "path";

let loaded = false;

const ENV_FILENAMES = [".env.production.local", ".env.local", ".env.production", ".env"];

function parseEnvContent(content: string) {
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;

    const key = trimmed.slice(0, eq).trim();
    let raw = trimmed.slice(eq + 1).trim();

    if (
      (raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))
    ) {
      try {
        raw = JSON.parse(raw) as string;
      } catch {
        raw = raw.slice(1, -1);
      }
    }

    if (!process.env[key]) {
      process.env[key] = raw;
    }
  }
}

export function findProjectRoot(): string {
  const candidates = new Set<string>([process.cwd()]);

  let dir = __dirname;
  for (let i = 0; i < 10; i += 1) {
    candidates.add(dir);
    dir = path.dirname(dir);
  }

  for (const root of candidates) {
    if (fs.existsSync(path.join(root, "package.json"))) {
      return root;
    }
  }

  return process.cwd();
}

export function getLoadedEnvFiles(): string[] {
  const root = findProjectRoot();
  return ENV_FILENAMES.filter((name) =>
    fs.existsSync(path.join(root, name)),
  ).map((name) => name);
}

export function loadRuntimeEnv() {
  if (loaded) return;

  const root = findProjectRoot();

  for (const name of [...ENV_FILENAMES].reverse()) {
    const filePath = path.join(root, name);
    if (!fs.existsSync(filePath)) continue;
    parseEnvContent(fs.readFileSync(filePath, "utf8"));
  }

  loadEnvConfig(root);
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
