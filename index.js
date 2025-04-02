/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import * as Updater from './updater';
import metadata from './metadata';
import tabcompletion from './utils/tabcompletion';

const isDev = true;

const log = (...args) => ChatLib.chat('§7[§6ioi§7]§r ' + args.join(' '));

function tryUpdate(delay = 0) {
	try {
		const meta = Updater.loadMeta();
		const version = Updater.getVersion(meta);
		if (Updater.compareVersions(version, metadata.version) <= 0) return -1; // Already up to date
		const url = Updater.getAssetURL(meta);
		try {
			Updater.downloadUpdate(url);
		} catch (e) {
			if (isDev) log('failed to download update:', e, e.stack);
			else log('failed to download update');
			console.log(e + '\n' + e.stack);
			new TextComponent({ text: ChatLib.getCenteredText('&nClick to Manually Update'), clickEvent: { action: 'open_url', value: `https://github.com/${metadata.author}/${metadata.name}/releases/latest` } }).chat();

			return 1;
		}
		log('Update Found!');
		new TextComponent({ text: ChatLib.getCenteredText('Click to View on Github'), clickEvent: { action: 'open_url', value: `https://github.com/${metadata.author}/${metadata.name}/releases/latest` } }).chat();
		new TextComponent({ text: ChatLib.getCenteredText('Click to Print Changelog'), clickEvent: { action: 'run_command', value: '/ioi viewChangelog' } }).chat();
		log(ChatLib.getCenteredText(`§4${metadata.version} -> ${version}`));
		log('');
		if (!isDev) log(ChatLib.getCenteredText('§c§lNote: Your CT Modules will be reloaded.'));
		else log(ChatLib.getCenteredText('§c§lNote: IOI will be reloaded'));

		new TextComponent(new TextComponent({ text: '§a[UPDATE]', clickEvent: { action: 'run_command', value: '/ioi update accept' } }), new TextComponent({ text: '§4[CANCLE]', clickEvent: { action: 'run_command', value: '/ioi update deny' } })).chat();
		return 0;
	} catch (e) {
		if (isDev) log('failed to fetch update:', e, e.stack);
		else log('failed to fetch update');
		console.log(e + '\n' + e.stack);
	}
	return -1;
}

register('command', (...args) => {
	switch (args[0]) {
		case 'update':
			switch (args[1]) {
				case 'accept':
					Updater.applyUpdate();
					ChatLib.command('ct load');
					// isDev ? ChatLib.command('ioi reload') : ChatLib.command('ct load');
					break;
				case 'deny':
					Updater.deleteDownload();
					break;
				default:
					new Thread(() => {
						if (tryUpdate() === -1) log('You are up to date!');
					}).start();
					break;
			}
			break;
		case 'viewChangelog':
			try {
				/** @type {{ version: string, changes: { type: 'feat' | 'fix' | 'misc' | 'del' | 'change', desc: string }[] }[]} */
				const changelog = Updater.getChangelogDiff(metadata.version).reverse();
				const typeColors = {
					feat: '&a+ feat: ',
					fix: '&f= fix: ',
					misc: '&7= misc: ',
					change: '&6/ change: ',
					del: '&4- remove: ',
				};
				const typeSort = ['feat', 'del', 'change', 'fix', 'misc'];
				changelog.forEach(({ version, changes }, i) => {
					if (i > 0) ChatLib.chat('');
					ChatLib.chat(centerMessage('&3&lv' + version));
					changes.sort((a, b) => typeSort.indexOf(a.type) - typeSort.indexOf(b.type)).forEach(({ type, desc }) => ChatLib.chat(typeColors[type] + desc));
				});
			} catch (e) {
				log('&4failed to get changelog, is the update downloaded?');
			}
	}
})
	.setName('ioi-testing')
	.setTabCompletions(
		tabcompletion({
			update: [],
			viewChangelog: [],
		})
	);
