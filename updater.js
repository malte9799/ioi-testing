import Logger from './utils/Logger';
const metadata = JSON.parse(FileLib.read('ioi-testing', 'metadata.json'));

const File = Java.type('java.io.File');
const FileOutputStream = Java.type('java.io.FileOutputStream');
const URL = Java.type('java.net.URL');
const Long = Java.type('java.lang.Long');
const Channels = Java.type('java.nio.channels.Channels');

export function loadMeta() {
	try {
		// https://github.com/malte9799/ioi-testing
		// const url = metadata.git_repository.replace('github.com', 'api.github.com/repos') + '/releases';

		if (!Logger.isDev()) return JSON.parse(FileLib.getUrlContent(`https://api.github.com/repos/${metadata.creator}/${metadata.name}/releases/latest`));
		return JSON.parse(FileLib.getUrlContent(`https://api.github.com/repos/${metadata.creator}/${metadata.name}/releases`))[0];
	} catch (/** @type {Java.type("java.io.FileNotFoundException")} */ e) {
		return null;
	}
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
	const temp = FileLib.exists(rel('temp/changelog.json'));
	const changelog = JSON.parse(FileLib.read(rel(temp ? 'temp/changelog.json' : 'changelog.json'))).data.reverse();
	const i = changelog.findIndex((v) => v.version === cv);
	if (i < 0) return changelog;
	if (temp) return changelog.slice(i + 1);
	else return [changelog[i]];
}

export function applyUpdate(sev) {
	if (!Logger.isDev()) deleteOld();
	copy(new File(rel('temp')), new File(rel('')));
	deleteDownload();
}

export function deleteDownload() {
	rimraf(rel('temp'));
}

function deleteOld() {
	const files = new File(rel('')).listFiles();
	files.forEach((file) => {
		if (file.getName() == 'data') return;
		rimraf(file);
	});
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
		}
	});
}
