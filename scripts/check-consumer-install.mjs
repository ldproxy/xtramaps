// Checks the packages the way a consumer receives them: packed tarballs,
// installed into a fresh project without a lockfile. The monorepo itself
// cannot show these problems, because its lockfile pins whatever versions
// dedupe and its workspaces link source instead of the published files.
//
// Usage: node scripts/check-consumer-install.mjs [--react=<major>]
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";

const REPO_ROOT = join(import.meta.dirname, "..");

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

// Peer ranges consumers will see violated, with the reason it is accepted.
// Remove an entry once its cause is gone, so the check guards against it again.
const KNOWN_INVALID_PEERS = [
  {
    dependent: "node_modules/reactstrap/node_modules/react-popper",
    reason:
      "reactstrap 9 (latest stable) pins react-popper 2, whose react peer stops at 18; it works on React 19 (the stories run on it)",
  },
];

// Entry points that run in Node at build time (Vite plugins), not in the browser.
const TOOLING_SUBPATHS = ["./vite"];

const { values: options } = parseArgs({
  options: { react: { type: "string", default: "19" } },
});

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function runCollectingFailure(command, args, cwd) {
  try {
    run(command, args, cwd);
    return null;
  } catch (error) {
    return `${error.stdout}${error.stderr}`.trim();
  }
}

function installedVersion(name) {
  const manifest = join(REPO_ROOT, "node_modules", name, "package.json");
  return JSON.parse(readFileSync(manifest, "utf8")).version;
}

function packWorkspaces(destination) {
  const packed = JSON.parse(
    run(
      "npm",
      ["pack", "--workspaces", "--json", "--pack-destination", destination],
      REPO_ROOT,
    ),
  );
  return packed.map(({ name, filename }) => ({
    name,
    tarball: join(destination, filename),
  }));
}

function checkPackageShape(packages) {
  const problems = [];
  for (const { name, tarball } of packages) {
    const publintFailure = runCollectingFailure(
      "npx",
      ["publint", "run", tarball, "--level", "warning", "--strict"],
      REPO_ROOT,
    );
    const attwFailure = runCollectingFailure(
      "npx",
      [
        "attw",
        tarball,
        "--profile",
        "node16",
        "--exclude-entrypoints",
        "./dist/index.css",
        "--format",
        "ascii",
      ],
      REPO_ROOT,
    );
    if (publintFailure) problems.push(`${name} (publint):\n${publintFailure}`);
    if (attwFailure) problems.push(`${name} (attw):\n${attwFailure}`);
  }
  return problems;
}

function listEntrypoints(consumerDir, packages) {
  const entrypoints = { browser: [], stylesheets: [], tooling: [] };
  for (const { name } of packages) {
    const manifestPath = join(consumerDir, "node_modules", name, "package.json");
    const { exports } = JSON.parse(readFileSync(manifestPath, "utf8"));
    for (const subpath of Object.keys(exports)) {
      const specifier = subpath === "." ? name : `${name}${subpath.slice(1)}`;
      if (subpath.endsWith(".css")) entrypoints.stylesheets.push(specifier);
      else if (TOOLING_SUBPATHS.includes(subpath))
        entrypoints.tooling.push(specifier);
      else entrypoints.browser.push(specifier);
    }
  }
  return entrypoints;
}

function importEverything(specifiers) {
  const imports = specifiers.map(
    (specifier, index) => `import * as entry${index} from "${specifier}";`,
  );
  const uses = specifiers.map((_, index) => `entry${index}`).join(", ");
  return `${imports.join("\n")}\nconsole.log(${uses});\n`;
}

function writeConsumerProject(consumerDir, packages, reactMajor) {
  const tarballSpecs = Object.fromEntries(
    packages.map(({ name, tarball }) => [name, `file:${tarball}`]),
  );
  const manifest = {
    name: "xtramaps-consumer-check",
    private: true,
    type: "module",
    dependencies: {
      ...tarballSpecs,
      react: `^${reactMajor}`,
      "react-dom": `^${reactMajor}`,
      "@types/react": `^${reactMajor}`,
      "@types/react-dom": `^${reactMajor}`,
      typescript: installedVersion("typescript"),
      vite: installedVersion("vite"),
    },
    // Sibling @xtramaps packages must come from these tarballs, not the registry.
    overrides: tarballSpecs,
  };
  writeFileSync(
    join(consumerDir, "package.json"),
    JSON.stringify(manifest, null, 2),
  );
}

function writeConsumerSources(consumerDir, entrypoints) {
  const stylesheetImports = entrypoints.stylesheets
    .map((specifier) => `import "${specifier}";`)
    .join("\n");
  writeFileSync(
    join(consumerDir, "browser.ts"),
    `${stylesheetImports}\n${importEverything(entrypoints.browser)}`,
  );
  writeFileSync(
    join(consumerDir, "tooling.ts"),
    importEverything(entrypoints.tooling),
  );
  writeFileSync(
    join(consumerDir, "index.html"),
    '<!doctype html><script type="module" src="./browser.ts"></script>\n',
  );
  const tsconfig = {
    compilerOptions: {
      module: "nodenext",
      moduleResolution: "nodenext",
      target: "es2022",
      strict: true,
      noEmit: true,
      // Consumers with skipLibCheck off type-check our declarations too.
      skipLibCheck: false,
      types: [],
    },
    files: ["browser.ts", "tooling.ts"],
  };
  writeFileSync(
    join(consumerDir, "tsconfig.json"),
    JSON.stringify(tsconfig, null, 2),
  );
}

// npm ls exits non-zero when it finds problems, but still prints the full tree.
function readDependencyTree(consumerDir) {
  try {
    return JSON.parse(run("npm", ["ls", "--all", "--json"], consumerDir));
  } catch (error) {
    return JSON.parse(error.stdout);
  }
}

function* walkDependencies(node) {
  for (const [name, dependency] of Object.entries(node.dependencies ?? {})) {
    yield [name, dependency];
    yield* walkDependencies(dependency);
  }
}

function checkSingleInstances(tree) {
  const versionsByName = new Map();
  for (const [name, { version }] of walkDependencies(tree)) {
    if (!versionsByName.has(name)) versionsByName.set(name, new Set());
    versionsByName.get(name).add(version);
  }
  return SINGLE_INSTANCE_PACKAGES.filter(
    (name) => (versionsByName.get(name)?.size ?? 0) > 1,
  ).map(
    (name) =>
      `${name} resolves to more than one version: ${[...versionsByName.get(name)].join(", ")}`,
  );
}

function checkPeerRanges(tree) {
  const isKnown = (invalid) =>
    KNOWN_INVALID_PEERS.some(({ dependent }) =>
      invalid.endsWith(`from ${dependent}`),
    );
  const problems = new Set();
  for (const [name, { version, invalid, missing }] of walkDependencies(tree)) {
    if (invalid && !isKnown(invalid))
      problems.add(`${name}@${version} invalid: ${invalid}`);
    if (missing) problems.add(`${name} missing: ${missing}`);
  }
  return [...problems];
}

// Third-party declarations have their own errors under skipLibCheck: false;
// only errors in the consumer files or in our own declarations are ours to fix.
function checkTypes(consumerDir) {
  const failure = runCollectingFailure("npx", ["tsc", "-p", "."], consumerDir);
  if (!failure) return [];
  const isOurError = (line) =>
    /^(browser|tooling)\.ts\(/.test(line) ||
    /^node_modules\/@xtramaps\/[^/]+\/dist\//.test(line);
  return failure.split("\n").filter(isOurError);
}

function checkBrowserBundle(consumerDir) {
  const failure = runCollectingFailure(
    "npx",
    ["vite", "build", "--logLevel", "error"],
    consumerDir,
  );
  return failure ? [failure] : [];
}

function checkToolingImports(consumerDir, toolingEntrypoints) {
  return toolingEntrypoints.flatMap((specifier) => {
    const failure = runCollectingFailure(
      "node",
      ["--input-type=module", "--eval", `await import("${specifier}");`],
      consumerDir,
    );
    return failure ? [`${specifier}: ${failure}`] : [];
  });
}

function report(title, problems) {
  if (problems.length === 0) {
    console.log(`ok   ${title}`);
    return true;
  }
  console.error(`FAIL ${title}`);
  for (const problem of problems) console.error(`  ${problem}`);
  return false;
}

const consumerDir = mkdtempSync(join(tmpdir(), "xtramaps-consumer-"));
let passed = false;
try {
  console.log(`Consumer project (React ${options.react}): ${consumerDir}`);
  const packages = packWorkspaces(consumerDir);
  writeConsumerProject(consumerDir, packages, options.react);
  run(
    "npm",
    ["install", "--no-audit", "--no-fund", "--loglevel=error"],
    consumerDir,
  );
  const entrypoints = listEntrypoints(consumerDir, packages);
  writeConsumerSources(consumerDir, entrypoints);

  const tree = readDependencyTree(consumerDir);

  const results = [
    report("package shape (publint, attw)", checkPackageShape(packages)),
    report(
      `single instance of ${SINGLE_INSTANCE_PACKAGES.join(", ")}`,
      checkSingleInstances(tree),
    ),
    report("peer dependency ranges", checkPeerRanges(tree)),
    report("types (tsc, nodenext, skipLibCheck off)", checkTypes(consumerDir)),
    report("browser bundle (vite build)", checkBrowserBundle(consumerDir)),
    report(
      "tooling imports in Node",
      checkToolingImports(consumerDir, entrypoints.tooling),
    ),
  ];
  passed = results.every(Boolean);
} finally {
  if (passed) rmSync(consumerDir, { recursive: true, force: true });
  else {
    console.error(`Kept for inspection: ${consumerDir}`);
    process.exitCode = 1;
  }
}
