// AutoUpdate Template for ChatTriggers Module
// For Minecraft 1.21.4
// Created: April 2025

// Import Java classes for file operations
const File = Java.type('java.io.File');
const FileOutputStream = Java.type('java.io.FileOutputStream');
const URL = Java.type('java.net.URL');
const BufferedInputStream = Java.type('java.io.BufferedInputStream');
const Files = Java.type('java.nio.file.Files');
const StandardCopyOption = Java.type('java.nio.file.StandardCopyOption');
const Paths = Java.type('java.nio.file.Paths');

const metadata = JSON.parse(FileLib.read('ioi-testing', 'metadata.json'));

// const metadata.name = metadata.name; // Change this to your module name
// const metadata.version = '0.0.1'; // Your module version
const githubUser = 'malte9799'; // Change to your GitHub username
const githubRepo = 'ioi-testing'; // Change to your GitHub repo name

// Register the module to run on game load
register('gameLoad', () => {
	ChatLib.chat(`§a[${metadata.name}] §fModule loaded! Version: §b${metadata.version}`);
	checkForUpdates();
});

// Function to check for updates
function checkForUpdates() {
	new Thread(() => {
		try {
			ChatLib.chat(`§a[${metadata.name}] §fChecking for updates...`);

			// Get the latest release info from GitHub API using FileLib
			const releaseUrl = `https://api.github.com/repos/${githubUser}/${githubRepo}/releases/latest`;
			const releaseInfoStr = FileLib.getUrlContent(releaseUrl);

			if (!releaseInfoStr) {
				ChatLib.chat(`§c[${metadata.name}] §fFailed to check for updates.`);
				return;
			}

			const releaseInfo = JSON.parse(releaseInfoStr);
			const latestVersion = releaseInfo.tag_name.replace('v', '');

			// Compare versions
			if (compareVersions(latestVersion, metadata.version) > 0) {
				ChatLib.chat(`§a[${metadata.name}] §fUpdate available: §b${latestVersion}`);
				ChatLib.chat(`§a[${metadata.name}] §fCurrent version: §b${metadata.version}`);

				// Ask user if they want to update
				new Message(new TextComponent('§a[§fClick to update§a]').setClick('run_command', '/update' + metadata.name)).chat();
			} else {
				ChatLib.chat(`§a[${metadata.name}] §fYou are using the latest version.`);
			}
		} catch (e) {
			ChatLib.chat(`§c[${metadata.name}] §fError checking for updates: ${e}`);
		}
	}).start();
}

// Command to update the module
register('command', () => {
	downloadLatestRelease();
}).setName('update' + metadata.name);

// Function to download and install the latest release
function downloadLatestRelease() {
	new Thread(() => {
		try {
			ChatLib.chat(`§a[${metadata.name}] §fDownloading latest version...`);

			// Get the latest release info using FileLib
			const releaseUrl = `https://api.github.com/repos/${githubUser}/${githubRepo}/releases/latest`;
			const releaseInfoStr = FileLib.getUrlContent(releaseUrl);
			const releaseInfo = JSON.parse(releaseInfoStr);

			if (!releaseInfo || !releaseInfo.assets || releaseInfo.assets.length === 0) {
				ChatLib.chat(`§c[${metadata.name}] §fNo release assets found.`);
				return;
			}

			// Find the ZIP asset
			let zipAsset = null;
			for (let i = 0; i < releaseInfo.assets.length; i++) {
				if (releaseInfo.assets[i].name.endsWith('.zip')) {
					zipAsset = releaseInfo.assets[i];
					break;
				}
			}

			if (!zipAsset) {
				ChatLib.chat(`§c[${metadata.name}] §fNo ZIP file found in release assets.`);
				return;
			}

			// Download the ZIP file
			const downloadUrl = zipAsset.browser_download_url;
			const moduleFolder = new File(`./config/ChatTriggers/modules/${metadata.name}`);
			const backupFolder = new File(`./config/ChatTriggers/modules/${metadata.name}_backup`);
			const zipFile = new File(`./config/ChatTriggers/modules/${metadata.name}_update.zip`);

			// Create backup of current module
			if (moduleFolder.exists()) {
				ChatLib.chat(`§a[${metadata.name}] §fCreating backup...`);
				if (backupFolder.exists()) {
					deleteFolder(backupFolder);
				}
				copyFolder(moduleFolder, backupFolder);
			}

			// Download the ZIP file using Java
			ChatLib.chat(`§a[${metadata.name}] §fDownloading from ${downloadUrl}...`);
			downloadFile(downloadUrl, zipFile);

			// Extract the ZIP file using FileLib.unzip
			ChatLib.chat(`§a[${metadata.name}] §fExtracting update...`);

			// Clean the module folder before extracting (except metadata.json)
			if (moduleFolder.exists()) {
				File.listFiles(moduleFolder).forEach((file) => {
					if (file.getName() !== 'metadata.json') {
						if (file.isDirectory()) {
							deleteFolder(file);
						} else {
							file.delete();
						}
					}
				});
			} else {
				moduleFolder.mkdirs();
			}

			// Extract the ZIP using FileLib.unzip
			FileLib.unzip(zipFile.getAbsolutePath(), moduleFolder.getAbsolutePath());

			// Delete the ZIP file
			zipFile.delete();

			ChatLib.chat(`§a[${metadata.name}] §fUpdate complete! Restart your game to apply changes.`);
		} catch (e) {
			ChatLib.chat(`§c[${metadata.name}] §fError downloading update: ${e.toString()}`);
			ChatLib.chat(`§c[${metadata.name}] §fError details: ${e.stack}`);
		}
	}).start();
}

// Helper function to download file using Java
function downloadFile(url, destination) {
	try {
		const connection = new URL(url).openConnection();
		connection.setRequestProperty('User-Agent', 'ChatTriggers-Module');

		let input = null;
		let output = null;

		try {
			input = new BufferedInputStream(connection.getInputStream());
			output = new FileOutputStream(destination);

			const buffer = Java.type('byte[]')(1024);
			let bytesRead;

			while ((bytesRead = input.read(buffer)) !== -1) {
				output.write(buffer, 0, bytesRead);
			}
		} finally {
			if (input !== null) input.close();
			if (output !== null) output.close();
		}
	} catch (e) {
		ChatLib.chat(`§c[${metadata.name}] §fError downloading file: ${e}`);
		throw e;
	}
}

// Helper function to delete a folder recursively
function deleteFolder(folder) {
	if (folder.isDirectory()) {
		const files = folder.listFiles();
		if (files) {
			for (let i = 0; i < files.length; i++) {
				deleteFolder(files[i]);
			}
		}
	}
	folder.delete();
}

// Helper function to copy a folder recursively
function copyFolder(source, target) {
	if (source.isDirectory()) {
		if (!target.exists()) {
			target.mkdirs();
		}

		const files = source.listFiles();
		for (let i = 0; i < files.length; i++) {
			const sourceFile = files[i];
			const targetFile = new File(target, sourceFile.getName());
			copyFolder(sourceFile, targetFile);
		}
	} else {
		Files.copy(Paths.get(source.toURI()), Paths.get(target.toURI()), StandardCopyOption.REPLACE_EXISTING);
	}
}

// Helper function to compare version strings
function compareVersions(v1, v2) {
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
