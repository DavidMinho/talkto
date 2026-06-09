import { writeFileSync } from "node:fs";

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
for (const key of keys) {
  const value = process.env[key];
  if (value !== undefined && value !== "") {
    lines.push(`${key}=${JSON.stringify(value)}`);
  }
}

if (!lines.some((line) => line.startsWith("NODE_ENV="))) {
  lines.push('NODE_ENV="production"');
}

if (!lines.some((line) => line.startsWith("HOSTINGER="))) {
  lines.push('HOSTINGER="1"');
}

const body = `${lines.join("\n")}\n`;
for (const name of [".env", ".env.production", ".env.local"]) {
  writeFileSync(name, body, "utf8");
}
console.log(
  `Wrote ${lines.length} variables to .env, .env.production, and .env.local`,
);
