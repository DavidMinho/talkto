import { createServer } from "http";
import { type IncomingMessage, type ServerResponse } from "http";
import next from "next";
import {
  getAuthSecret,
  getDatabaseUrl,
  getNextAuthUrl,
  loadRuntimeEnv,
} from "./src/lib/runtime-env";
import { initSocketServer } from "./src/server/socket";

loadRuntimeEnv();

const dev = process.env.NODE_ENV === "development";
const hostname = process.env.HOSTNAME ?? (dev ? "localhost" : "0.0.0.0");
const port = parseInt(process.env.PORT ?? "3010", 10);

if (!dev) {
  const missing: string[] = [];
  if (!getDatabaseUrl()) missing.push("DATABASE_URL");
  if (!getNextAuthUrl()) missing.push("NEXTAUTH_URL");
  if (!getAuthSecret()) missing.push("NEXTAUTH_SECRET");

  if (missing.length > 0) {
    const msg = `Missing env at startup: ${missing.join(", ")}`;
    if (process.env.HOSTINGER === "1") {
      console.warn(`WARN: ${msg} — app will run in degraded mode`);
    } else {
      console.error(msg);
      process.exit(1);
    }
  }
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function parseUrl(req: IncomingMessage) {
  const base = `http://${req.headers.host ?? "localhost"}`;
  const url = new URL(req.url ?? "/", base);
  return {
    pathname: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
  };
}

app.prepare().then(() => {
  console.log(`Preparing Talkto (NODE_ENV=${process.env.NODE_ENV}, PORT=${port})`);
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parseUrl(req);
      await handle(req, res as ServerResponse, parsedUrl as never);
    } catch (err) {
      console.error("Request handler error:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  initSocketServer(server);

  server.listen(port, hostname, () => {
    console.log(`> Talkto ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error("Failed to start Talkto:", err);
  process.exit(1);
});
