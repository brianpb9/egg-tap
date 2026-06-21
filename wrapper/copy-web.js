// Copies the web game from the repo root into ./www for the Capacitor build.
// Run from the wrapper/ folder:  npm run copy:web
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const www = path.resolve(__dirname, 'www');
const items = ['index.html', 'manifest.json', 'assets']; // add 'bubu_eggs.html' if you ship the catalog

function cp(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const f of fs.readdirSync(src)) cp(path.join(src, f), path.join(dst, f));
  } else {
    fs.copyFileSync(src, dst);
  }
}

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });
for (const it of items) {
  const s = path.join(root, it);
  if (fs.existsSync(s)) cp(s, path.join(www, it));
}
console.log('✓ Copied web game → wrapper/www');
