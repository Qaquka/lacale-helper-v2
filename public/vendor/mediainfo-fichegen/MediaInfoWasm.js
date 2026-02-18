(function () {
  var script = typeof document !== 'undefined' ? document.currentScript : null;
  var scriptDirectory = new URL('./', script && script.src ? script.src : (typeof document !== 'undefined' ? document.baseURI : '/')).toString();

  var CDN_ESM_URL = 'https://cdn.jsdelivr.net/npm/mediainfo.js@0.3.6/dist/esm-bundle/index.min.js';
  var CDN_WASM_URL = 'https://cdn.jsdelivr.net/npm/mediainfo.js@0.3.6/dist/MediaInfoModule.wasm';

  var LOCAL_WASM_URLS = [
    new URL('MediaInfoWasm.wasm', scriptDirectory).toString(),
    new URL('MediaInfoModule.wasm', scriptDirectory).toString()
  ];

  async function createWithWasm(wasmUrl) {
    var module = await import(CDN_ESM_URL);
    var MediaInfoFactory = module.default || module;
    return MediaInfoFactory({
      format: 'object',
      locateFile: function () { return wasmUrl; }
    });
  }

  async function create() {
    var lastError = null;
    for (var i = 0; i < LOCAL_WASM_URLS.length; i += 1) {
      try {
        return await createWithWasm(LOCAL_WASM_URLS[i]);
      } catch (error) {
        lastError = error;
      }
    }
    try {
      return await createWithWasm(CDN_WASM_URL);
    } catch (error) {
      throw lastError || error;
    }
  }

  window.LCFichegenMediaInfo = {
    scriptDirectory: scriptDirectory,
    localWasmUrls: LOCAL_WASM_URLS,
    cdnEsmUrl: CDN_ESM_URL,
    cdnWasmUrl: CDN_WASM_URL,
    create: create
  };
})();
