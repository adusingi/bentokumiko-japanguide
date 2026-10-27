import { mkdtemp, readFile, readdir, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { enquiryFields } from "../src/components/enquiry.mjs";

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

const defaultBuild = build();
assert(defaultBuild.status === 0, `Default build failed: ${defaultBuild.stderr}`);
await inspectSite(path.join(root, "dist"), "preview");
const preview = await readFile(path.join(root, "dist/enquire.html"), "utf8");
assert(preview.includes("nothing on this page is sent or saved"), "Preview disclosure is missing");
assert(preview.includes('method="dialog"'), "Preview form can submit over the network without JavaScript");
assert(!preview.includes("tally.so/embed/"), "Unconfigured build contains a Tally embed");

const configuredDirectory = await mkdtemp(path.join(os.tmpdir(), "bento-tally-"));
const configuredBuild = build({ TALLY_FORM_ID: "abc123", SITE_OUTPUT_DIR: configuredDirectory });
assert(configuredBuild.status === 0, `Configured build failed: ${configuredBuild.stderr}`);
await inspectSite(configuredDirectory, "tally");
const configured = await readFile(path.join(configuredDirectory, "enquire.html"), "utf8");
assert(configured.includes("https://tally.so/embed/abc123"), "Configured build lacks Tally embed");
assert(configured.includes("https://tally.so/r/abc123"), "Configured build lacks hosted-form fallback");
assert(!configured.includes("enquiry-preview.js"), "Configured build includes preview behavior");

const invalidDirectory = path.join(os.tmpdir(), `bento-invalid-${process.pid}`);
const invalidBuild = build({ TALLY_FORM_ID: "not/a/form", SITE_OUTPUT_DIR: invalidDirectory });
assert(invalidBuild.status !== 0, "Invalid Tally configuration did not fail");
assert(invalidBuild.stderr.includes("TALLY_FORM_ID"), "Invalid Tally error is unclear");

const sourceImages = (await readdir(path.join(root, "src/assets/images"))).filter((file) => /\.(?:jpg|png|webp)$/.test(file));
assert(sourceImages.length === 8, `Expected 8 deduplicated images, found ${sourceImages.length}`);

console.log(`Checks passed: ${assertions} assertions; preview, configured Tally and invalid configuration states verified.`);
