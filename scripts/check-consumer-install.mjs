// Installs the packed workspace packages into a fresh project without a
// lockfile, the way a consumer gets them from npm, and fails if a map library
// resolves to more than one version. The monorepo lockfile cannot show this:
// it pins whatever versions dedupe, while consumers resolve open ranges fresh.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SINGLE_INSTANCE_PACKAGES = [
  "ol",
  "maplibre-gl",
  "@cesium/engine",
  "@cesium/widgets",
  "react",
  "react-dom",
  "vue",
  "svelte",
];

function npm(args, cwd) {
  return execFileSync("npm", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
}

function packWorkspaces(destination) {
  const packed = JSON.parse(
    npm([
      "pack",
      "--workspaces",
      "--json",
      "--pack-destination",
      destination,
    ]),
  );
  return packed.map(({ name, filename }) => ({ name, filename }));
}

function writeConsumerManifest(dir, tarballs) {
  const fileSpecs = Object.fromEntries(
    tarballs.map(({ name, filename }) => [name, `file:./${filename}`]),
  );
  const manifest = {
    name: "xtramaps-consumer-check",
    private: true,
    dependencies: fileSpecs,
    // Sibling @xtramaps packages must come from these tarballs, not the registry.
    overrides: fileSpecs,
  };
  writeFileSync(join(dir, "package.json"), JSON.stringify(manifest, null, 2));
}

function collectVersions(node, versionsByName = new Map()) {
  for (const [name, dependency] of Object.entries(node.dependencies ?? {})) {
    if (!versionsByName.has(name)) versionsByName.set(name, new Set());
    versionsByName.get(name).add(dependency.version);
    collectVersions(dependency, versionsByName);
  }
  return versionsByName;
}

function findDuplicates(dir) {
  const tree = JSON.parse(npm(["ls", "--all", "--json"], dir));
  const versionsByName = collectVersions(tree);
  return SINGLE_INSTANCE_PACKAGES.filter(
    (name) => (versionsByName.get(name)?.size ?? 0) > 1,
  ).map((name) => `${name}: ${[...versionsByName.get(name)].join(", ")}`);
}

const consumerDir = mkdtempSync(join(tmpdir(), "xtramaps-consumer-"));
try {
  const tarballs = packWorkspaces(consumerDir);
  writeConsumerManifest(consumerDir, tarballs);
  npm(["install", "--no-audit", "--no-fund", "--loglevel=error"], consumerDir);

  const duplicates = findDuplicates(consumerDir);
  if (duplicates.length > 0) {
    console.error(
      "A consumer install resolves these packages to more than one version:",
    );
    for (const duplicate of duplicates) console.error(`  ${duplicate}`);
    console.error(`Inspect with: cd ${consumerDir} && npm ls <package>`);
    process.exitCode = 1;
  } else {
    console.log(
      `Consumer install of ${tarballs.length} packages has a single instance of: ${SINGLE_INSTANCE_PACKAGES.join(", ")}`,
    );
  }
} finally {
  if (!process.exitCode) rmSync(consumerDir, { recursive: true, force: true });
}
