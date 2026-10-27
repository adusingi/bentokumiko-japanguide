import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, stat, symlink, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { request } from "node:http";
import os from "node:os";
import path from "node:path";
import { planOutputDirectory, prepareOutputDirectory } from "../lib/output-directory.mjs";
import { enquiryFields } from "../src/components/enquiry.mjs";
import { createPreviewServer } from "./serve.mjs";

const root = process.cwd();
const requiredPages = ["index", "about", "service", "testimonials", "blog", "enquire", "404"];
let assertions = 0;

function assert(condition, message) {
  assertions += 1;
  if (!condition) throw new Error(message);
}

function build(environment = {}) {
  return spawnSync(process.execPath, ["build.mjs"], {
    cwd: root,
    env: { ...process.env, ...environment },
    encoding: "utf8",
  });
}

async function filesRecursively(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const candidate = path.join(directory, entry);
    if ((await stat(candidate)).isDirectory()) files.push(...await filesRecursively(candidate));
    else files.push(candidate);
  }
  return files;
}

async function snapshotDirectory(directory) {
  try {
    const files = await filesRecursively(directory);
    const hash = createHash("sha256");
    for (const file of files.sort()) {
      hash.update(path.relative(directory, file));
      hash.update(await readFile(file));
    }
    return hash.digest("hex");
  } catch (error) {
    if (error.code === "ENOENT") return "missing";
    throw error;
  }
}

async function assertRejects(operation, message) {
  let rejected = false;
  try {
    await operation();
  } catch {
    rejected = true;
  }
  assert(rejected, message);
}

function get(server, requestPath) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const outgoing = request({ hostname: "127.0.0.1", port: address.port, path: requestPath }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve({ status: response.statusCode, body: Buffer.concat(chunks).toString("utf8") }));
    });
    outgoing.on("error", reject);
    outgoing.end();
  });
}

async function inspectSite(directory, expectedMode) {
  const files = await filesRecursively(directory);
  const relativeFiles = new Set(files.map((file) => path.relative(directory, file)));
  const topLevel = (await readdir(directory)).sort();
  const expectedTopLevel = ["404.html", "about.html", "assets", "blog.html", "enquire.html", "health", "index.html", "robots.txt", "service.html", "sitemap.xml", "testimonials.html"].sort();
  assert(JSON.stringify(topLevel) === JSON.stringify(expectedTopLevel), `Unexpected output boundary: ${topLevel.join(", ")}`);
  const htmlByPage = new Map();

  for (const page of requiredPages) {
    const file = path.join(directory, `${page}.html`);
    assert(relativeFiles.has(`${page}.html`), `Missing ${page}.html`);
    const html = await readFile(file, "utf8");
    htmlByPage.set(page, html);
    assert(/<main(?:\s|>)/.test(html), `${page}.html has no main landmark`);
    assert(html.includes('class="skip-link"'), `${page}.html has no skip link`);
    assert(html.includes("<link rel=\"canonical\""), `${page}.html has no canonical link`);
    assert(!html.includes("data:image/"), `${page}.html still embeds a data URI`);
    assert(!html.includes("I've received your enquiry"), `${page}.html claims receipt without proof`);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    assert(ids.length === new Set(ids).size, `${page}.html contains duplicate IDs`);

    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const reference = match[1];
      if (/^(?:https?:|mailto:|#)/.test(reference)) continue;
      const [rawPath, anchor] = reference.split("#");
      const localPath = rawPath.startsWith("/")
        ? rawPath.slice(1)
        : path.normalize(path.join(path.dirname(`${page}.html`), rawPath));
      assert(relativeFiles.has(localPath), `${page}.html references missing ${localPath}`);
      if (anchor && localPath.endsWith(".html")) {
        const targetPage = path.basename(localPath, ".html");
        const targetHtml = htmlByPage.get(targetPage) || await readFile(path.join(directory, localPath), "utf8");
        assert(new RegExp(`id=["']${anchor}["']`).test(targetHtml), `${reference} has no target`);
      }
    }
  }

  const index = htmlByPage.get("index");
  const enquire = htmlByPage.get("enquire");
  const blog = htmlByPage.get("blog");
  assert(!index.includes('id="blog"'), "Homepage still contains the removed blog section");
  assert(!index.includes("Five tips from my recent guests"), "Homepage still contains blog editorial copy");
  assert(blog.includes("5 things our guests learned in Japan"), "Blog page lost the supplied guest tips");
  assert(blog.includes("My Japan, personally visited"), "Blog page lost the city content");
  assert(index.includes(`data-form-mode="${expectedMode}"`), `Homepage did not render ${expectedMode} form`);
  assert(enquire.includes(`data-form-mode="${expectedMode}"`), `Enquire page did not render ${expectedMode} form`);
  if (expectedMode === "preview") {
    for (const [key] of enquiryFields) assert(enquire.includes(`data-field="${key}"`), `Preview form lacks ${key}`);
  }
  assert(relativeFiles.has("robots.txt"), "Missing robots.txt");
  assert(relativeFiles.has("sitemap.xml"), "Missing sitemap.xml");
  assert(relativeFiles.has("health"), "Missing health endpoint file");
}

const testRoot = await mkdtemp(path.join(os.tmpdir(), "bento-check-"));
const distBefore = await snapshotDirectory(path.join(root, "dist"));

const previewDirectory = path.join(testRoot, "preview");
const previewBuild = build({ TALLY_FORM_ID: "", SITE_OUTPUT_DIR: previewDirectory });
assert(previewBuild.status === 0, `Preview build failed: ${previewBuild.stderr}`);
await inspectSite(previewDirectory, "preview");
const preview = await readFile(path.join(previewDirectory, "enquire.html"), "utf8");
assert(preview.includes("nothing on this page is sent or saved"), "Preview disclosure is missing");
assert(preview.includes('method="dialog"'), "Preview form can submit over the network without JavaScript");
assert(!preview.includes("tally.so/embed/"), "Unconfigured build contains a Tally embed");

const configuredDirectory = path.join(testRoot, "configured");
const configuredBuild = build({ TALLY_FORM_ID: "abc123", SITE_OUTPUT_DIR: configuredDirectory });
assert(configuredBuild.status === 0, `Configured build failed: ${configuredBuild.stderr}`);
await inspectSite(configuredDirectory, "tally");
const configured = await readFile(path.join(configuredDirectory, "enquire.html"), "utf8");
assert(configured.includes("https://tally.so/embed/abc123"), "Configured build lacks Tally embed");
assert(configured.includes("https://tally.so/r/abc123"), "Configured build lacks hosted-form fallback");
assert(!configured.includes("enquiry-preview.js"), "Configured build includes preview behavior");

const invalidDirectory = path.join(testRoot, "invalid");
const invalidBuild = build({ TALLY_FORM_ID: "not/a/form", SITE_OUTPUT_DIR: invalidDirectory });
assert(invalidBuild.status !== 0, "Invalid Tally configuration did not fail");
assert(invalidBuild.stderr.includes("TALLY_FORM_ID"), "Invalid Tally error is unclear");

const populatedDirectory = path.join(testRoot, "populated");
await mkdir(populatedDirectory);
const sentinel = path.join(populatedDirectory, "keep.txt");
await writeFile(sentinel, "keep me\n");
const populatedBuild = build({ TALLY_FORM_ID: "", SITE_OUTPUT_DIR: populatedDirectory });
assert(populatedBuild.status !== 0, "A populated custom output directory was accepted");
assert(await readFile(sentinel, "utf8") === "keep me\n", "A populated custom output directory was modified");

const symlinkTarget = path.join(testRoot, "symlink-target");
const symlinkOutput = path.join(testRoot, "symlink-output");
await mkdir(symlinkTarget);
await writeFile(path.join(symlinkTarget, "keep.txt"), "keep me too\n");
await symlink(symlinkTarget, symlinkOutput, "dir");
const symlinkBuild = build({ TALLY_FORM_ID: "", SITE_OUTPUT_DIR: symlinkOutput });
assert(symlinkBuild.status !== 0, "A symbolic-link output directory was accepted");
assert(await readFile(path.join(symlinkTarget, "keep.txt"), "utf8") === "keep me too\n", "A symbolic-link target was modified");

await assertRejects(
  () => planOutputDirectory({ repositoryRoot: root, requestedOutput: "src" }),
  "A source directory was accepted as output",
);
await assertRejects(
  () => planOutputDirectory({ repositoryRoot: root, requestedOutput: path.dirname(root) }),
  "A repository ancestor was accepted as output",
);

const fixtureRepository = path.join(testRoot, "fixture-repository");
const fixtureDist = path.join(fixtureRepository, "dist");
await mkdir(fixtureDist, { recursive: true });
await writeFile(path.join(fixtureDist, "stale.txt"), "stale\n");
const fixturePlan = await planOutputDirectory({ repositoryRoot: fixtureRepository });
await prepareOutputDirectory(fixturePlan);
assert((await readdir(fixtureDist)).length === 0, "The known generated output was not replaced during a normal rebuild");

const server = createPreviewServer(previewDirectory);
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
try {
  const malformed = await get(server, "/%ZZ");
  assert(malformed.status === 400, `Malformed URL returned ${malformed.status} instead of 400`);
  const traversal = await get(server, "/%2e%2e%2fpackage.json");
  assert(traversal.status === 404, `Traversal URL returned ${traversal.status} instead of 404`);
  assert(!traversal.body.includes('"scripts"'), "Traversal response exposed a repository file");
  const health = await get(server, "/health");
  assert(health.status === 200 && health.body === "ok\n", "Preview server did not remain healthy after malformed requests");
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

const distAfter = await snapshotDirectory(path.join(root, "dist"));
assert(distAfter === distBefore, "pnpm test changed the configured dist directory");

const sourceImages = (await readdir(path.join(root, "src/assets/images"))).filter((file) => /\.(?:jpg|png|webp)$/.test(file));
assert(sourceImages.length === 8, `Expected 8 deduplicated images, found ${sourceImages.length}`);

console.log(`Checks passed: ${assertions} assertions; isolated builds, safe output handling and preview routing verified.`);
