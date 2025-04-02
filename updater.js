import metadata from './metadata';

const File = Java.type('java.io.File');
const FileOutputStream = Java.type('java.io.FileOutputStream');
const URL = Java.type('java.net.URL');
const BufferedInputStream = Java.type('java.io.BufferedInputStream');
const Files = Java.type('java.nio.file.Files');
const StandardCopyOption = Java.type('java.nio.file.StandardCopyOption');
const Paths = Java.type('java.nio.file.Paths');
const Long = Java.type('java.lang.Long');
const Channels = Java.type('java.nio.channels.Channels');

export function loadMeta() {
	return JSON.parse(FileLib.getUrlContent(`https://api.github.com/repos/${metadata.author}/${metadata.name}/releases/latest`));
}

export function getVersion(meta) {
	const version = meta.tag_name;
	if (version.toLowerCase().startsWith('v')) return version.slice(1);
	return version;
}

export function compareVersions(v1, v2) {
	const parts1 = v1.split('.').map(Number);
	const parts2 = v2.split('.').map(Number);

	for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
		const part1 = i < parts1.length ? parts1[i] : 0;
		const part2 = i < parts2.length ? parts2[i] : 0;

		if (part1 > part2) return 1;
		if (part1 < part2) return -1;
	}

	return 0;
}

export function getAssetURL(meta) {
	return meta.assets.find((v) => v.name === `${metadata.name}.zip`).browser_download_url;
}

function rel(p) {
	return `./config/ChatTriggers/modules/${metadata.name}/${p}`;
}

export function downloadUpdate(url) {
	const tmp = new File(rel('temp'));
	if (tmp.exists()) rimraf(tmp);

	const connection = new URL(url).openConnection();
	connection.setRequestProperty('User-Agent', 'ChatTriggers-Module');

	const input = connection.getInputStream();
	const output = new FileOutputStream(rel('temp.zip'));

	const ReadableByteChannel = Channels.newChannel(input);
	output.getChannel().transferFrom(ReadableByteChannel, 0, Long.MAX_VALUE);

	input.close();
	output.close();

	FileLib.unzip(rel('temp.zip'), rel('temp'));
	FileLib.delete(rel('temp.zip'));
}

export function getChangelogDiff(cv) {
	if (!FileLib.exists(rel('temp/changelog.json'))) return [];
	const changelog = JSON.parse(FileLib.read(rel('temp/changelog.json'))).data;
	const i = changelog.findIndex((v) => v.version === cv);
	if (i >= 0) return changelog.slice(i + 1);
	return changelog;
}

export function applyUpdate(sev) {
	copy(new File(rel('temp')), new File(rel('')));
	deleteDownload();
}

export function deleteDownload() {
	rimraf(rel('temp'));
}

function rimraf(src) {
	if (!(src instanceof File)) src = new File(src);
	if (!src.exists()) return;
	src.listFiles()?.forEach((f) => {
		if (f.isDirectory()) rimraf(f);
		else f.delete();
	});
	src.delete();
}

function copy(src, dst) {
	if (!dst.exists()) dst.mkdir();
	src.listFiles().forEach((f) => {
		const d = new File(dst, f.getName());
		if (f.isDirectory()) copy(f, d);
		else {
			if (d.exists()) d.delete();
			f.renameTo(d);
			// FileLib.write(d.getPath(), FileLib.read(f.getPath()));
		}
	});
}

//

//

//

//

//

//

//

//

// const githubUser = 'malte9799';
// const githubRepo = 'ioi-testing';

// function checkForUpdates() {
// 	new Thread(() => {
// 		try {
// 			console.log(`§a[${metadata.name}] §fChecking for updates...`);

// 			// Get the latest release info from GitHub API using FileLib
// 			const releaseUrl = `https://api.github.com/repos/${githubUser}/${githubRepo}/releases/latest`;
// 			const releaseInfoStr = FileLib.getUrlContent(releaseUrl);

// 			if (!releaseInfoStr) {
// 				console.log(`§c[${metadata.name}] §fFailed to check for updates.`);
// 				return;
// 			}

// 			const releaseInfo = JSON.parse(releaseInfoStr);
// 			const latestVersion = releaseInfo.tag_name.replace('v', '');

// 			// Compare versions
// 			if (compareVersions(latestVersion, metadata.version) > 0) {
// 				console.log(`§a[${metadata.name}] §fUpdate available: §b${latestVersion}`);
// 				console.log(`§a[${metadata.name}] §fCurrent version: §b${metadata.version}`);

// 				// Ask user if they want to update
// 				// new TextComponent('§a[§fClick to update§a]').setClick('run_command', '/update' + metadata.name).chat();
// 				new TextComponent({ text: '§a[§fClick to update§a]', clickEvent: { action: 'run_command', value: '/update' + metadata.name } }).chat();
// 			} else {
// 				console.log(`§a[${metadata.name}] §fYou are using the latest version.`);
// 			}
// 		} catch (e) {
// 			console.log(`§c[${metadata.name}] §fError checking for updates: ${e}`);
// 		}
// 	}).start();
// }

// // Command to update the module
// register('command', () => {
// 	downloadLatestRelease();
// }).setName('update' + metadata.name);

// // Function to download and install the latest release
// function downloadLatestRelease() {
// 	new Thread(() => {
// 		try {
// 			console.log(`§a[${metadata.name}] §fDownloading latest version...`);

// 			// Get the latest release info using FileLib
// 			const releaseUrl = `https://api.github.com/repos/${githubUser}/${githubRepo}/releases/latest`;
// 			const releaseInfoStr = FileLib.getUrlContent(releaseUrl);
// 			const releaseInfo = JSON.parse(releaseInfoStr);

// 			if (!releaseInfo || !releaseInfo.assets || releaseInfo.assets.length === 0) {
// 				console.log(`§c[${metadata.name}] §fNo release assets found.`);
// 				return;
// 			}

// 			// Find the ZIP asset
// 			let zipAsset = null;
// 			for (let i = 0; i < releaseInfo.assets.length; i++) {
// 				if (releaseInfo.assets[i].name.endsWith('.zip')) {
// 					zipAsset = releaseInfo.assets[i];
// 					break;
// 				}
// 			}

// 			if (!zipAsset) {
// 				console.log(`§c[${metadata.name}] §fNo ZIP file found in release assets.`);
// 				return;
// 			}

// 			// Download the ZIP file
// 			const downloadUrl = zipAsset.browser_download_url;
// 			const moduleFolder = new File(`./config/ChatTriggers/modules/${metadata.name}`);
// 			const backupFolder = new File(`./config/ChatTriggers/modules/${metadata.name}_backup`);
// 			const zipFile = new File(`./config/ChatTriggers/modules/${metadata.name}_update.zip`);

// 			// Create backup of current module
// 			if (moduleFolder.exists()) {
// 				console.log(`§a[${metadata.name}] §fCreating backup...`);
// 				if (backupFolder.exists()) {
// 					deleteFolder(backupFolder);
// 				}
// 				copyFolder(moduleFolder, backupFolder);
// 			}

// 			// Download the ZIP file using Java
// 			console.log(`§a[${metadata.name}] §fDownloading from ${downloadUrl}...`);
// 			downloadFile(downloadUrl, zipFile);

// 			// Extract the ZIP file using FileLib.unzip
// 			console.log(`§a[${metadata.name}] §fExtracting update...`);

// 			// Clean the module folder before extracting (except metadata.json)
// 			if (moduleFolder.exists()) {
// 				moduleFolder.listFiles().forEach((file) => {
// 					if (file.getName() !== 'metadata.json') {
// 						if (file.isDirectory()) {
// 							if (file.getName() !== '.git') deleteFolder(file);
// 							// deleteFolder(file);
// 						} else {
// 							file.delete();
// 						}
// 					}
// 				});
// 			} else {
// 				moduleFolder.mkdirs();
// 			}

// 			// Extract the ZIP using FileLib.unzip
// 			FileLib.unzip(zipFile.getAbsolutePath(), moduleFolder.getAbsolutePath());

// 			// Delete the ZIP file
// 			zipFile.delete();

// 			console.log(`§a[${metadata.name}] §fUpdate complete! Restart your game to apply changes.`);
// 		} catch (e) {
// 			console.log(`§c[${metadata.name}] §fError downloading update: ${e.toString()}`);
// 			console.log(`§c[${metadata.name}] §fError details: ${e.stack}`);
// 		}
// 	}).start();
// }

// // Helper function to download file using Java
// function downloadFile(url, destination) {
// 	try {
// 		// const fileContent = FileLib.getUrlContent(url);
// 		// FileLib.write(destination.getAbsolutePath(), fileContent);
// 		const connection = new URL(url).openConnection();
// 		connection.setRequestProperty('User-Agent', 'ChatTriggers-Module'); // Get input stream from URL and create output file

// 		const input = connection.getInputStream();
// 		const output = new FileOutputStream(destination); // Transfer bytes from input to output

// 		const ReadableByteChannel = Channels.newChannel(input);
// 		output.getChannel().transferFrom(ReadableByteChannel, 0, Long.MAX_VALUE); // Close streams

// 		input.close();
// 		output.close();
// 	} catch (e) {
// 		console.log(`§c[${metadata.name}] §fError downloading file: ${e}`);
// 		throw e;
// 	}
// }

// // Helper function to delete a folder recursively
// function deleteFolder(folder) {
// 	if (folder.isDirectory()) {
// 		const files = folder.listFiles();
// 		if (files) {
// 			for (let i = 0; i < files.length; i++) {
// 				deleteFolder(files[i]);
// 			}
// 		}
// 	}
// 	folder.delete();
// }

// // Helper function to copy a folder recursively
// function copyFolder(source, target) {
// 	if (source.isDirectory()) {
// 		if (!target.exists()) {
// 			target.mkdirs();
// 		}

// 		const files = source.listFiles();
// 		for (let i = 0; i < files.length; i++) {
// 			const sourceFile = files[i];
// 			const targetFile = new File(target, sourceFile.getName());
// 			copyFolder(sourceFile, targetFile);
// 		}
// 	} else {
// 		Files.copy(Paths.get(source.toURI()), Paths.get(target.toURI()), StandardCopyOption.REPLACE_EXISTING);
// 	}
// }

// // Helper function to compare version strings
// function compareVersions(v1, v2) {
// 	const parts1 = v1.split('.').map(Number);
// 	const parts2 = v2.split('.').map(Number);

// 	for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
// 		const part1 = i < parts1.length ? parts1[i] : 0;
// 		const part2 = i < parts2.length ? parts2[i] : 0;

// 		if (part1 > part2) return 1;
// 		if (part1 < part2) return -1;
// 	}

// 	return 0;
// }
