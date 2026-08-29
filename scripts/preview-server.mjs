import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT || 43127);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

function resolveFile(urlPath) {
  const decoded = decodeURIComponent((urlPath || "/").split("?")[0].split("#")[0]);
  const safe = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
  let file = path.join(root, safe);

  if (!file.startsWith(root)) return null;

  try {
    const stat = fs.statSync(file);
    if (stat.isDirectory()) file = path.join(file, "index.html");
  } catch {
    if (file.endsWith("/")) file = path.join(file, "index.html");
  }

  return file;
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const file = resolveFile(req.url);
  if (!file) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const type = mime[path.extname(file).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(data);
  });
});

server.listen(port, "0.0.0.0", () => {
  // Cursor Preview looks for a Ready line and npm start.
  console.log(`✓ Ready on http://127.0.0.1:${port}`);
  console.log(`- Local:   http://127.0.0.1:${port}`);
  console.log(`- Network: http://0.0.0.0:${port}`);
});
