#!/usr/bin/env node
const { execFile } = require('child_process');

async function run() {
  try {
    const nextCli = require.resolve('next/dist/bin/next');
    const node = process.execPath;
    const args = ['--max-old-space-size=4096', nextCli, 'build'];

    const child = execFile(node, args, { stdio: 'inherit' });

    child.on('exit', (code) => {
      process.exit(code);
    });
  } catch (err) {
    console.error('Failed to spawn next build:', err);
    process.exit(1);
  }
}

run();
