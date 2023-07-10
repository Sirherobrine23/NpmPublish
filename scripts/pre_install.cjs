#!/usr/bin/env node
const path = require("node:path");
const fs = require("node:fs/promises");
const { execFileSync } = require("node:child_process");

const exists = async (path) => fs.open(path).then(() => true, () => false);

(async function() {
  if (await exists(path.join(__dirname, "node_modules/"))) return;
  execFileSync("npm", [ "install", "--no-audit", "--omit=dev" ], { stdio: "inherit", cwd: path.resolve(__dirname, "..") });
})();