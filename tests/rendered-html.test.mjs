import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("production build contains the ChemBridge application and social card", async () => {
  const clientAssets = new URL("../dist/client/assets/", import.meta.url);
  const files = await readdir(clientAssets);
  const appFile = files.find((file) => file.startsWith("ChemBridgeApp-") && file.endsWith(".js"));
  assert.ok(appFile, "ChemBridge client bundle was not emitted");
  const bundle = await readFile(new URL(appFile, clientAssets), "utf8");
  assert.match(bundle, /ChemBridge/);
  assert.match(bundle, /Периодтық кесте/);
  assert.match(bundle, /Реакция конструкторы/);
  await access(new URL("../dist/client/og.png", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
});
