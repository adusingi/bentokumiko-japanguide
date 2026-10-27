import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve(process.cwd(), process.env.SITE_OUTPUT_DIR || "dist");
const port = Number(process.env.PORT || 4173);
const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

await access(root);

createServer(async (request, response) => {
  if (!request.url || !["GET", "HEAD"].includes(request.method || "")) {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const requested = pathname === "/" ? "/index.html" : pathname;
  let file = path.resolve(root, `.${requested}`);
  if (!file.startsWith(`${root}${path.sep}`)) file = path.join(root, "404.html");
  let status = 200;
  try {
    if (!(await stat(file)).isFile()) throw new Error("not a file");
  } catch {
    file = path.join(root, "404.html");
    status = 404;
  }
  response.writeHead(status, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
  if (request.method === "HEAD") response.end();
  else createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Previewing ${root} at http://127.0.0.1:${port}`);
});
