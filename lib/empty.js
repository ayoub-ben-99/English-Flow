// Browser stub for Node built-ins referenced by Emscripten glue code
// (piper WASM loader). Those branches only run under Node and are never
// executed in the browser — the alias just satisfies the bundler.
module.exports = {};
