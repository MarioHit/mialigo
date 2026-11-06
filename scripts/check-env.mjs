#!/usr/bin/env node
// Vérifie que .env.local définit toutes les variables listées dans .env.example.
// - crée .env.local (copie de .env.example) s'il n'existe pas ;
// - n'affiche QUE des noms de variables, jamais de valeurs ;
// - code de sortie 1 si une variable est absente, vide ou encore à sa valeur bidon.

import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const examplePath = join(root, ".env.example");
const localPath = join(root, ".env.local");

/** Parse un fichier .env en Map nom → valeur (sans jamais l'afficher). */
function parseEnv(path) {
  const vars = new Map();
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, "");
    vars.set(match[1], value);
  }
  return vars;
}

if (!existsSync(examplePath)) {
  console.error("[check-env] .env.example introuvable.");
  process.exit(1);
}

const expected = parseEnv(examplePath);

if (!existsSync(localPath)) {
  copyFileSync(examplePath, localPath);
  console.log("[check-env] .env.local créé à partir de .env.example.");
}

const actual = parseEnv(localPath);
const missing = [...expected].filter(([name, placeholder]) => {
  const value = actual.get(name);
  return value === undefined || value === "" || value === placeholder;
}).map(([name]) => name);

if (missing.length > 0) {
  console.log("[check-env] Variables à renseigner dans .env.local :");
  for (const name of missing) console.log(`  - ${name}`);
  process.exit(1);
}

console.log(`[check-env] OK : ${expected.size} variable(s) renseignée(s).`);
