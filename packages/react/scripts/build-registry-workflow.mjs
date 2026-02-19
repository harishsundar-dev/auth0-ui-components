#!/usr/bin/env node

/**
 * Registry Build Workflow Script
 *
 * Orchestrates the full registry build pipeline:
 * 1. Reads the core package version to determine the major version
 * 2. Generates registry.json via generate-registry.mjs
 * 3. Validates registry.json via validate-registry.mjs
 * 4. Runs shadcn build to produce versioned output in docs-site/public/r/v{major}/{version}
 * 5. Rewrites @/ alias imports to relative paths so output works without alias config
 * 6. Updates docs-site/public/r/versions.json to point latest/current to the new version
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGES_DIR = path.resolve(__dirname, '..');
const CORE_PACKAGE_JSON = path.resolve(PACKAGES_DIR, '../core/package.json');
const DOCS_SITE_PUBLIC_R = path.resolve(
  PACKAGES_DIR,
  '../../docs-site/public/r',
);

function getCoreVersion() {
  if (!fs.existsSync(CORE_PACKAGE_JSON)) {
    console.error(`Core package.json not found at ${CORE_PACKAGE_JSON}`);
    process.exit(1);
  }
  const pkg = JSON.parse(fs.readFileSync(CORE_PACKAGE_JSON, 'utf-8'));
  const version = pkg.version;
  const major = version.split('.')[0];
  console.log(`Core package version: ${version} (Major: ${major})`);
  return { version, major };
}

function runCommand(command) {
  try {
    console.log(`> ${command}`);
    execSync(command, { stdio: 'inherit', cwd: PACKAGES_DIR });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('Starting Registry Build Workflow...\n');

  // 1. Get core version
  const { version, major } = getCoreVersion();
  const versionedOutputDir = path.join(DOCS_SITE_PUBLIC_R, `v${major}`, version);

  // 2. Generate registry
  console.log('\n--- Step 1: Generate registry ---');
  runCommand('node scripts/generate-registry.mjs');

  // 3. Validate registry
  console.log('\n--- Step 2: Validate registry ---');
  runCommand('node scripts/validate-registry.mjs');

  // 4. Build registry with shadcn
  console.log(`\n--- Step 3: Build registry to ${versionedOutputDir} ---`);

  // Ensure output directory exists
  if (!fs.existsSync(versionedOutputDir)) {
    console.log(`Creating directory: ${versionedOutputDir}`);
    fs.mkdirSync(versionedOutputDir, { recursive: true });
  }

  // Pre-create subdirectories based on registry items
  const registryPath = path.join(PACKAGES_DIR, 'registry.json');
  if (fs.existsSync(registryPath)) {
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    const subdirs = new Set();
    registry.items.forEach((item) => {
      const dirname = path.dirname(item.name);
      if (dirname && dirname !== '.') {
        subdirs.add(dirname);
      }
    });

    subdirs.forEach((subdir) => {
      const subdirPath = path.join(versionedOutputDir, subdir);
      if (!fs.existsSync(subdirPath)) {
        console.log(`Creating subdirectory: ${subdir}`);
        fs.mkdirSync(subdirPath, { recursive: true });
      }
    });
  }

  // Run shadcn build
  runCommand(`pnpm exec shadcn build -o "${versionedOutputDir}"`);

  // 5. Skip @/ alias rewriting — consumers are expected to have the @/ → src/ alias configured
  console.log('\n--- Step 4: Skipping @/ alias rewriting (kept as-is) ---');

  // 6. Update versions.json
  console.log('\n--- Step 5: Update versions.json ---');
  const versionsJsonPath = path.join(DOCS_SITE_PUBLIC_R, 'versions.json');
  let versionsData = {};
  if (fs.existsSync(versionsJsonPath)) {
    versionsData = JSON.parse(fs.readFileSync(versionsJsonPath, 'utf-8'));
  }

  const status = version.includes('beta') ? 'beta' : 'stable';

  versionsData.name = 'auth0-ui-components';
  versionsData.current = version;
  versionsData.latest = version;
  versionsData.beta = status === 'beta' ? version : (versionsData.beta || null);
  versionsData.stable = status === 'stable' ? version : (versionsData.stable || null);

  if (!versionsData.majorVersions) versionsData.majorVersions = {};
  versionsData.majorVersions[`v${major}`] = {
    latest: version,
    stable: status === 'stable' ? version : (versionsData.majorVersions[`v${major}`]?.stable || null),
    beta: status === 'beta' ? version : (versionsData.majorVersions[`v${major}`]?.beta || null),
  };

  if (!versionsData.versions) versionsData.versions = {};
  versionsData.versions[version] = { status, major };

  fs.writeFileSync(versionsJsonPath, JSON.stringify(versionsData, null, 2) + '\n', 'utf-8');
  console.log(`Updated versions.json: latest=${version}`);

  console.log('\nRegistry workflow completed successfully!');
  console.log(`Output: ${versionedOutputDir}`);
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
