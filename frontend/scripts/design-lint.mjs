import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const design = readFileSync(resolve(root, "DESING.MD"), "utf8");

const required = ["## Overview", "## Colors", "## Typography", "## Layout", "## Components", "## Implementation"];
let ok = true;
for (const s of required) {
  if (!design.includes(s)) {
    console.error(`Missing section: ${s}`);
    ok = false;
  }
}
if (!ok) process.exit(1);
console.log("design:lint OK");
