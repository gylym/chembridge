import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "github-pages-dist");
let html = await readFile(path.join(dist, "index.html"), "utf8");

const stylesheet = html.match(/<link rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/);
if (stylesheet) {
  const cssPath = stylesheet[1].replace(/^\/chembridge\//, "");
  const css = await readFile(path.join(dist, cssPath), "utf8");
  html = html.replace(stylesheet[0], () => `<style>${css}</style>`);
}

const moduleScript = html.match(/<script type="module"[^>]+src="([^"]+)"[^>]*><\/script>/);
if (moduleScript) {
  const jsPath = moduleScript[1].replace(/^\/chembridge\//, "");
  const js = (await readFile(path.join(dist, jsPath), "utf8")).replaceAll("</script", "<\\/script");
  html = html.replace(moduleScript[0], () => `<script type="module">${js}</script>`);
}

await rm(path.join(dist, "assets"), { recursive: true, force: true });
await writeFile(path.join(dist, "index.html"), html);
await cp(path.join(dist, "index.html"), path.join(dist, "404.html"));
await mkdir(path.join(root, "docs"), { recursive: true });
await cp(path.join(dist, "index.html"), path.join(root, "docs", "index.html"));
await cp(path.join(dist, "404.html"), path.join(root, "docs", "404.html"));
