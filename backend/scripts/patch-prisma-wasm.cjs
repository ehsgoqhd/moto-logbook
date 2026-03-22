/**
 * Patches the Prisma WASM client so it loads query_engine_bg.wasm
 * via fs.readFileSync instead of a dynamic import() expression.
 *
 * Background: tsx (esbuild) does not resolve Node.js package "imports"
 * (the # prefix), so `import('#wasm-engine-loader')` returns undefined
 * on ARM64 Windows, crashing at startup. This patch replaces that call
 * with a direct readFileSync + WebAssembly.compile, which works in any
 * Node.js environment.
 *
 * Run automatically via the "postinstall" npm script.
 */

'use strict'

const fs = require('fs')
const path = require('path')

const WASM_JS = path.join(__dirname, '../node_modules/.prisma/client/wasm.js')
const MARKER = '/* patched:patch-prisma-wasm */'

if (!fs.existsSync(WASM_JS)) {
  console.log('[patch-prisma-wasm] wasm.js not found — skipping.')
  process.exit(0)
}

const src = fs.readFileSync(WASM_JS, 'utf8')

if (src.includes(MARKER)) {
  console.log('[patch-prisma-wasm] Already patched — skipping.')
  process.exit(0)
}

const OLD = `  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine
  }`

const NEW = `  getQueryEngineWasmModule: async () => { ${MARKER}
    const wasmBuffer = require('fs').readFileSync(require('path').join(__dirname, 'query_engine_bg.wasm'))
    return WebAssembly.compile(wasmBuffer)
  }`

if (!src.includes(OLD)) {
  // Already patched by a previous run (marker absent but old code gone)
  if (src.includes('readFileSync') && src.includes('query_engine_bg.wasm')) {
    console.log('[patch-prisma-wasm] Already patched (no marker) — skipping.')
  } else {
    console.warn('[patch-prisma-wasm] Target pattern not found — Prisma version may have changed. Skipping.')
  }
  process.exit(0)
}

fs.writeFileSync(WASM_JS, src.replace(OLD, NEW))
console.log('[patch-prisma-wasm] ✓ wasm.js patched successfully.')
