const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TYPE = process.argv[2]; // 'patch', 'minor', 'major'
if (!['patch', 'minor', 'major'].includes(TYPE)) {
    console.error('Usage: node release.js <patch|minor|major>');
    process.exit(1);
}

const mobileDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(mobileDir, 'package.json');
const appJsonPath = path.join(mobileDir, 'app.json');

// 1. Read files
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const currentVersion = packageJson.version;
const parts = currentVersion.split('.').map(Number);

// 2. Increment version
if (TYPE === 'major') {
    parts[0]++;
    parts[1] = 0;
    parts[2] = 0;
} else if (TYPE === 'minor') {
    parts[1]++;
    parts[2] = 0;
} else if (TYPE === 'patch') {
    parts[2]++;
}

const newVersion = parts.join('.');
console.log(`Bumping version from ${currentVersion} to ${newVersion} (${TYPE})`);

// 3. Update files
packageJson.version = newVersion;
appJson.expo.version = newVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

// 4. Git commands
try {
    // Add changes
    execSync(`git add ${packageJsonPath} ${appJsonPath}`, { stdio: 'inherit', cwd: path.resolve(mobileDir, '..') });

    // Commit
    const commitMsg = `chore: release v${newVersion} (${TYPE})`;
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit', cwd: path.resolve(mobileDir, '..') });

    // Tag
    execSync(`git tag v${newVersion}`, { stdio: 'inherit', cwd: path.resolve(mobileDir, '..') });

    console.log(`Successfully updated to v${newVersion} and created tag.`);
    console.log(`To push: git push origin main && git push origin v${newVersion}`);
} catch (error) {
    console.error('Git command failed:', error.message);
    process.exit(1);
}
