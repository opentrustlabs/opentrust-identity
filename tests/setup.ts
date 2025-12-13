// Jest setup file for global polyfills

// Add TextEncoder/TextDecoder for @simplewebauthn/server
const util = require('util');
if (typeof global.TextEncoder === 'undefined') {
    (global as any).TextEncoder = util.TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
    (global as any).TextDecoder = util.TextDecoder;
}

// Add setImmediate polyfill if needed
if (typeof setImmediate === 'undefined') {
    (global as any).setImmediate = (fn: Function, ...args: any[]) => setTimeout(fn, 0, ...args);
    (global as any).clearImmediate = (id: any) => clearTimeout(id);
}
