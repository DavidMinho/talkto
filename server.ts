import { createServer } from "http";
import { type IncomingMessage, type ServerResponse } from "http";
import next from "next";
import { initSocketServer } from "./src/server/socket";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? (dev ? "localhost" : "0.0.0.0");
const port = parseInt(process.env.PORT ?? "3010", 10);

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
});
