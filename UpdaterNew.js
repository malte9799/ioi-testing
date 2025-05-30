import Settings, { ToggleSetting, TextSetting, ButtonSetting } from './Settings';

class Updater {
	constructor() {
		new ToggleSetting(null, {
			name: 'Auto Update',
			description: 'Automatically update IOI when a new version is available.',
			category: 'General',
			group: 'Update',
			value: true,
		});
		new ButtonSetting(null, {
			name: 'Check for Updates',
			description: 'Checks for updates to IOI.',
			category: 'General',
			group: 'Update',
			action: this.checkForUpdates,
		});
	}
	checkForUpdates() {
		new Thread(() => {});
	}
}

if (!global.ioi.Updater) {
	global.ioi.Updater = new Updater();
}
export default global.ioi.Updater;
