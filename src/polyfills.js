import { Buffer } from 'buffer';

// Solana wallet-adapter and web3.js need these globals
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis;
}
if (typeof globalThis.process === 'undefined') {
  globalThis.process = { env: {} };
}
