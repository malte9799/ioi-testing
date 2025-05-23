/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

if (!global.ioi) global.ioi = {};
global.ioi.onGameUnload = new Set();
register('gameUnload', () => {
	global.ioi.onGameUnload.forEach((func) => func());
	global.ioi = {};
});

new Sound({ source: 'ui.loom.select_pattern', category: Sound.Category.MASTER, pitch: 1.5, volume: 0.4 }).play();
new Sound({ source: 'ui.toast.in', category: Sound.Category.MASTER, pitch: 1.5, volume: 2 }).play();

const Color = Java.type('java.awt.Color');
// import metadata from './metadata';
// import * as Updater from './updater';
// import tabcompletion from './utils/tabcompletion';
import { Category, Group, ToggleOption, TickBoxOption, NumberOption, ColorOption, TextOption, SliderOption } from './settings/Options';

// new Category('General', 'General Description');
// new Group('Updates', 'General', 'Group Description');
new ToggleOption({
	value: true,
	name: 'Toggle Option',
	description: 'Toggle Option Description',
	category: 'General',
	group: 'Updates',
});
new TickBoxOption({
	value: true,
	name: 'Tickbox Option',
	description: 'Tickbox Option Description',
	category: 'General',
	group: 'Updates',
});
// new ColorOption({
// 	value: new Color(1, 0, 0),
// 	name: 'Color Option',
// 	description: 'Color Option Description',
// 	category: 'General',
// 	group: 'Updates',
// });
// new TextOption({
// 	value: 'Text Option Value',
// 	name: 'Text Option',
// 	description: 'Text Option Description',
// 	category: 'General',
// });

// new ToggleOption({
// 	value: true,
// 	name: 'Chamber Title',
// 	description: "Shows a Titles when you 'Sence a Chamber nearby...'",
// 	category: 'Mining',
// 	group: 'Chambers',
// });
// new ToggleOption({
// 	value: true,
// 	name: 'Activation Sound',
// 	description: 'Playes a Sound when you get Hast from SB',
// 	category: 'Mining',
// 	group: 'Speed Breaker',
// });
// new ToggleOption({
// 	value: true,
// 	name: 'Cooldown',
// 	description: 'Displays the Cooldown the SuperBreaker Abbility',
// 	category: 'Mining',
// 	group: 'Super Breaker',
// });
// new ToggleOption({
// 	value: true,
// 	name: 'Smart Check',
// 	description: 'Clancels the activation of SB when the mine is about to reset',
// 	category: 'Mining',
// 	group: 'Super Breaker',
// });

const featureFiles = getAllFeatureFiles('./config/ChatTriggers/modules/ioi-testing/features');
featureFiles.forEach((feature) => {
	require('./features/' + feature);
});

function getAllFeatureFiles(directory) {
	const dir = new java.io.File(directory);
	const result = [];

	function traverse(folder, parentPath = '') {
		const files = folder.listFiles();
		if (files == null) return;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const fileName = file.getName();
			const filePath = parentPath ? `${parentPath}/${fileName}` : fileName;
			if (file.isDirectory()) traverse(file, filePath);
			else if (fileName.endsWith('.js')) result.push(filePath);
		}
	}
	traverse(dir);
	return result;
}
