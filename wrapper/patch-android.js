// Post-`cap add android` patcher. Idempotent — safe to run repeatedly.
// Injects the AdMob APPLICATION_ID meta-data (required: without it the app crashes
// on launch when AdMob initializes) and a strings.xml entry to hold the real ID.
// Run from wrapper/ after the android/ project exists:  npm run patch
const fs = require('fs');
const path = require('path');
const A = path.resolve(__dirname, 'android', 'app', 'src', 'main');
const manifestPath = path.join(A, 'AndroidManifest.xml');
const stringsPath = path.join(A, 'res', 'values', 'strings.xml');

if (!fs.existsSync(manifestPath)) {
  console.error('✗ android/ project not found. Run "npm run add:android" first.');
  process.exit(1);
}

// 1) strings.xml — add admob_app_id placeholder if missing
let strings = fs.readFileSync(stringsPath, 'utf8');
if (!strings.includes('admob_app_id')) {
  strings = strings.replace('</resources>',
    '    <string name="admob_app_id">ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX</string>\n</resources>');
  fs.writeFileSync(stringsPath, strings);
  console.log('✓ Added admob_app_id to strings.xml  (replace with your REAL AdMob APP ID)');
} else {
  console.log('• strings.xml already has admob_app_id');
}

// 2) AndroidManifest.xml — add AdMob meta-data inside <application> if missing
let manifest = fs.readFileSync(manifestPath, 'utf8');
if (!manifest.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  const meta = '        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="@string/admob_app_id"/>\n    </application>';
  manifest = manifest.replace('</application>', meta);
  fs.writeFileSync(manifestPath, manifest);
  console.log('✓ Added AdMob APPLICATION_ID meta-data to AndroidManifest.xml');
} else {
  console.log('• AndroidManifest already has the AdMob meta-data');
}

console.log('\nNext:');
console.log('  1) Put your REAL AdMob APP ID in android/app/src/main/res/values/strings.xml (admob_app_id).');
console.log('  2) (Optional analytics) Drop google-services.json into android/app/, then add the');
console.log('     google-services Gradle plugin — see RELEASE_CHECKLIST.md section F. Without it,');
console.log('     analytics safely no-ops and the app still builds & runs.');
console.log('  3) Set up signing (key.properties + keystore) — see wrapper/README.md.');
console.log('  4) Build the .aab:  npm run build:aab   (or Android Studio: Build > Generate Signed Bundle)\n');
