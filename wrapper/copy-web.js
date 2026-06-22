// Copies the web game from the repo root into ./www for the Capacitor build,
// copies the Remove-Ads billing glue, and injects its <script> tag into www/index.html.
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

// Copy the billing glue (lives in wrapper/) into www and wire it into index.html.
const glueSrc = path.join(__dirname, 'billing-glue.js');
const idxPath = path.join(www, 'index.html');
if (fs.existsSync(glueSrc) && fs.existsSync(idxPath)) {
  fs.copyFileSync(glueSrc, path.join(www, 'billing-glue.js'));
  let html = fs.readFileSync(idxPath, 'utf8');
  if (!html.includes('billing-glue.js')) {
    const tag = '<script src="billing-glue.js"></script>';
    html = html.includes('</body>') ? html.replace('</body>', '  ' + tag + '\n</body>')
                                     : html + '\n' + tag + '\n';
    fs.writeFileSync(idxPath, html);
    console.log('✓ Injected billing-glue.js into www/index.html');
  }
}
console.log('✓ Copied web game → wrapper/www');
