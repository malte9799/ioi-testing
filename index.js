/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import './updater';

// const metadata = JSON.parse(FileLib.read('ioi-testing', 'metadata.json'));

// function update() {
// 	const gitUrl = `https://api.github.com/repos/malte9799/${metadata.name}/releases/latest`;

// 	data = JSON.parse(FileLib.getUrlContent(gitUrl));
// 	const latestVersion = data.tag_name.startsWith('v') ? data.tag_name.substring(1) : data.tag_name;
// 	if (!isNewerVersion(metadata.version, latestVersion)) {
// 		ChatLib.chat('Up to date!');
// 		return;
// 	}
// 	ChatLib.chat('New version available! Downloading...');
// 	const zipUrl = data.assets.find((v) => v.name === `${metadata.name}.zip`).browser_download_url;
// }

// function isNewerVersion(version1, version2) {
// 	// Implement semantic version comparison logic here
// 	const v1Parts = version1.split('.');
// 	const v2Parts = version2.split('.');
// 	for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
// 		const p1 = parseInt(v1Parts[i]) || 0;
// 		const p2 = parseInt(v2Parts[i]) || 0;
// 		if (p1 > p2) return true;
// 		if (p2 > p1) return false;
// 	}
// 	return false;
// }

// update();
ChatLib.chat('IOI-Testing Loaded!');
