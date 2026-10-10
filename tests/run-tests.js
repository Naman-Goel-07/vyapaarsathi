#!/usr/bin/env node

/**
 * VyapaarSathi E2E Test Suite Runner
 *
 * Runs tests/e2e-all-tiers.ts across Tiers 1-4
 * Exit Code: 0 on 100% pass, 1 on any failure
 */

const { spawn } = require('node:child_process')
const path = require('node:path')

const testFile = path.resolve(__dirname, 'e2e-all-tiers.ts')

console.log('[VyapaarSathi Test Runner] Initiating E2E Test Suite...')
console.log(`[VyapaarSathi Test Runner] Target: ${testFile}\n`)

const child = spawn(
  process.execPath,
  ['--no-warnings', '--experimental-strip-types', testFile],
  {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    env: process.env,
  }
)

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n[VyapaarSathi Test Runner] All tests passed cleanly with exit code 0.')
    process.exit(0)
  } else {
    console.error(`\n[VyapaarSathi Test Runner] Test suite failed with exit code ${code}.`)
    process.exit(code || 1)
  }
})

child.on('error', (err) => {
  console.error('[VyapaarSathi Test Runner] Failed to start test runner process:', err)
  process.exit(1)
})
