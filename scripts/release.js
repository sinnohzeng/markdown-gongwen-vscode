#!/usr/bin/env node
const { execSync } = require("child_process");

/**
 * Release helper script for markdown-gongwen-vscode.
 *
 * Usage: npm run release            # git-cliff decides the next version
 *        npm run release -- 2.3.1   # force an explicit version
 *
 * - Runs validation checks (lint:docs, test, build)
 * - Gets next version with git-cliff, unless one is passed as an argument
 * - Prepends the new release section to CHANGELOG.md (hand-written entries are kept)
 * - Bumps package.json version
 * - Commits changes and creates git tag
 * - Prints push/undo instructions
 */

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: "pipe", encoding: "utf8", ...opts }).trim();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Command failed: ${cmd}\n${message}`, { cause: err });
  }
}

function log(msg) {
  console.log(`\x1b[36m${msg}\x1b[0m`);
}

function error(msg) {
  console.error(`\x1b[31m${msg}\x1b[0m`);
}

try {
  // check that we are on main and working tree is clean
  const branch = run("git rev-parse --abbrev-ref HEAD");
  if (branch !== "main") {
    throw new Error(
      `You must be on the main branch to run this script. Current branch: ${branch}`,
    );
  }
  const status = run("git status --porcelain");
  if (status) {
    throw new Error(
      "Your working tree is not clean. Please commit or stash your changes before running this script.",
    );
  }

  // Run validation checks
  log("🔍 Running validation checks...");
  log("  📝 Validating feature file structure...");
  run("npm run lint:docs");
  log("  🧪 Running tests...");
  run("npm test");
  log("  🔨 Building extension...");
  run("npm run build");
  log("✅ All validation checks passed");

  // Check if git-cliff is available
  log("🔍 Checking git-cliff availability...");
  try {
    // Try npx first (will use local node_modules/.bin if available)
    run("npx --yes git-cliff --version", { stdio: "pipe" });
  } catch {
    throw new Error(
      "git-cliff is not available. Run 'npm install' to install dev dependencies, or install globally with: npm install -g git-cliff",
    );
  }

  // Determine next version: an explicit argument wins over git-cliff's guess.
  // git-cliff bumps by commit type, which is wrong whenever a feat-typed commit
  // carries no user-facing change (an icon swap, for instance).
  const requested = process.argv[2];
  let nextVersion;
  if (requested) {
    if (!/^v?\d+\.\d+\.\d+(?:-[\w.]+)?$/.test(requested)) {
      throw new Error(
        `Invalid version "${requested}". Expected a semver string such as 2.3.1.`,
      );
    }
    nextVersion = requested;
    log(`🔢 Using the version passed on the command line: ${nextVersion}`);
  } else {
    log("🔍 Determining next version with git-cliff...");
    nextVersion = run("npx git-cliff --bumped-version");
    if (!nextVersion) {
      throw new Error(
        "Failed to determine next version. Ensure you have conventional commits since the last tag.",
      );
    }
  }
  // Remove 'v' prefix if present for consistency
  nextVersion = nextVersion.replace(/^v/, "");
  const tagVersion = `v${nextVersion}`;
  log(`Next version: ${nextVersion} (tag: ${tagVersion})`);

  // Generate CHANGELOG
  log("📝 Prepending release notes to CHANGELOG.md...");
  run(`npx git-cliff --unreleased --tag ${tagVersion} --prepend CHANGELOG.md`);

  // Update package.json version
  log("🔢 Bumping package.json version...");
  run(`npm version ${nextVersion} --no-git-tag-version`);

  // Commit changes
  log("✅ Committing changes...");
  run("git add CHANGELOG.md package.json package-lock.json");
  run(`git commit -m "chore(release): ${tagVersion}"`);

  // Create git tag
  log("🏷️  Creating git tag...");
  run(`git tag ${tagVersion}`);

  log("🎉 Release prep complete!");
  console.log("\nNext steps:");
  console.log(
    `  1. Push changes and the new tag separately (never use --follow-tags,\n     it once pushed upstream legacy tags and triggered batch old releases):\n     git push origin main && git push origin ${tagVersion}`,
  );
  console.log(
    `  2. If you need to undo, run:\n     git reset --hard HEAD~1\n     git tag -d ${tagVersion}`,
  );
} catch (err) {
  error("Release failed:");
  error(err.message);
  if (err.stack && process.env.DEBUG) {
    console.error(err.stack);
  }
  process.exit(1);
}
