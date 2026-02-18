const fs = require('fs');
const path = require('path');
const assert = require('assert');

const bundle = fs.readFileSync(path.join(__dirname, '..', 'assets', 'index-Ddv4Ao2m.js'), 'utf8');

function extract(fnName, nextFnName) {
  const start = bundle.indexOf(`function ${fnName}(`);
  const end = bundle.indexOf(`function ${nextFnName}(`);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`Unable to extract ${fnName}`);
  }
  return bundle.slice(start, end);
}

let code = '';
code += extract('du', 'hu');
code += extract('xu', 'yu');
code += extract('yu', 'Cu');
code += extract('Cu', 'wu');
code += extract('wu', '_u');
code += extract('_u', 'Su');
code += extract('Su', 'Au');
code += extract('Au', 'Tu');
code += extract('Tu', 'ku');

eval(code);

const fixtures = [
  ['web-dl.nfo', 'WEB-DL'],
  ['bdrip.nfo', 'BDRip'],
  ['brrip.nfo', 'BRRip'],
  ['remux.nfo', 'REMUX'],
  ['hdtv.nfo', 'HDTV'],
  ['dvdrip.nfo', 'DVDRip'],
];

for (const [file, expectedSource] of fixtures) {
  const nfo = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'nfo', file), 'utf8');
  const general = du(nfo);
  assert.strictEqual(general.source, expectedSource, `${file}: source mismatch`);

  const title = Tu(
    {
      general,
      video: { resolution: '1080p', codec: 'x264' },
      audio: [{ codec: 'AAC', language: 'French' }],
      subtitles: [],
    },
    { contentName: 'Sample Movie', year: '2025', teamName: 'TEAM' }
  );

  assert.ok(!title.includes('SOURCE'), `${file}: title still contains SOURCE placeholder`);
  assert.ok(title.includes(expectedSource), `${file}: title does not include detected source`);
}

console.log('All source detection tests passed.');
