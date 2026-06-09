import { writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.env.INIT_CWD || process.cwd();

const keys = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "AUTH_SECRET",
  "NEXTAUTH_URL",
  "NODE_ENV",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "ADMIN_EMAILS",
  "HOSTINGER",
  "PORT",
];

const lines = [];
const present = [];
const missing = [];

for (const key of keys) {
  const value = process.env[key];
  if (value !== undefined && value !== "") {
    lines.push(`${key}=${JSON.stringify(value)}`);
    present.push(key);
  } else if (
    key !== "PORT" &&
    key !== "ADMIN_EMAILS" &&
    key !== "HOSTINGER"
  ) {
    missing.push(key);
  }
}

if (!lines.some((line) => line.startsWith("NODE_ENV="))) {
  lines.push('NODE_ENV="production"');
  present.push("NODE_ENV(default)");
}

if (!lines.some((line) => line.startsWith("HOSTINGER="))) {
  lines.push('HOSTINGER="1"');
}

const body = `${lines.join("\n")}\n`;

for (const name of [".env", ".env.production", ".env.local"]) {
  writeFileSync(join(root, name), body, "utf8");
}

console.log(`Env root: ${root}`);
console.log(`Wrote ${lines.length} variables to .env files`);
console.log(`Present: ${present.join(", ") || "(none)"}`);
if (missing.length > 0) {
  console.log(`Missing: ${missing.join(", ")}`);
  console.log("Fix: hPanel → Environment variables → Import .env");
  if (process.env.REQUIRE_ENV === "1") {
    process.exit(1);
  }
}
