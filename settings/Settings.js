//#region Imports
import Logger from '../utils/Logger';
const YetAnotherConfigLib = Java.type('dev.isxander.yacl3.api.YetAnotherConfigLib');
const TextMC = Java.type('net.minecraft.text.Text');
//#endregion

class SettingsClass {
	constructor() {
		this.categorys = new Set();
		this.groups = new Set();
		this.options = new Set();

		this.config = YetAnotherConfigLib.createBuilder().title(TextMC.of('SuperSettings'));

		register('command', (...args) => {
			switch (args[0]) {
				case 'debug':
					this.printTree();
					break;
				case 'open':
				default:
					this.open();
					break;
			}
		})
			.setName('SuperSettings')
			.setAliases('supersettings')
			.setTabCompletions('open', 'debug');
	}

	// getOrCreateGroup(category, group, description = '') {
	// 	return this.groups.find((e) => e.group === group && e.category === category) ?? new Group(category, group, description);
	// }
	// getOrCreateCategory(category, description = '') {
	// 	return this.categorys.find((e) => e.category === category) ?? new Category(category, description);
	// }

	build(parent = null) {
		global.temp = {};
		global.temp.categorys = this.categorys;
		global.temp.groups = this.groups;
		global.temp.options = this.options;
		this.categorys.forEach((category) => {
			this.config.category(category.build());
		});
		return this.config.build().generateScreen(parent);
	}

	open() {
		new Thread(() => {
			try {
				Client.currentGui.set(this.build());
			} catch (e) {
				Logger.error('Error building config gui');
				Logger.error(JSON.stringify(e, null, 2));
				Logger.warn(e.stack);
				throw e;
			}
		}).start();
	}

	save() {}

	printTree() {
		const corner = ['┌', '├', '└'];
		Logger.info('Settings Tree:');
		const cats = this.categorys.size;
		Array.from(this.categorys).forEach((category, index, arr) => {
			const catPos = index == arr.length - 1 ? 2 : index == 0 ? 0 : 1;
			Logger.info(`${corner[catPos]}${category.name}`);
			const options = Array.from(this.options).filter((option) => option.category === category.name);
			const groups = Array.from(this.groups).filter((group) => group.category === category.name);
			const groupOptSize = options.length + groups.length;
			let i = 0;

			options.forEach((option) => {
				const optPos = i == groupOptSize - 1 ? 2 : 1;
				i++;
				Logger.info(`${catPos <= 1 ? '│' : ' '} ${corner[optPos]}${option.name}`);
			});
			groups.forEach((group) => {
				const groupPos = i == groupOptSize - 1 ? 2 : 1;
				i++;
				Logger.info(`${catPos <= 1 ? '│' : ' '} ${corner[groupPos]}${group.name}`);
				const options = Array.from(this.options).filter((option) => option.category === category.name && option.group === group.name);
				options.forEach((option, index, arr) => {
					const optPos = index == arr.length - 1 ? 2 : 1;
					Logger.info(`${catPos <= 1 ? '│' : ' '} ${groupPos <= 1 ? '│' : ' '} ${corner[optPos]}${option.name}`);
				});
			});
			// this.options.forEach((option) => {
			// 	if (option.category !== category || option.group) return;
			// 	Logger.info(`${cat == 0 ? '│' : ' '}`);
			// });
			// this.groups.forEach((group) => {
			// 	if (group.category !== category) return;
			// });
		});
	}

	// static name(text) {
	// 	if (typeof text === 'string') return T.of(text);
	// 	else if (text instanceof TextComponent) return T.of(text.formattedText);
	// 	else if (text instanceof TextMC) return text;
	// 	throw new Error('Invalid name type');
	// }
	// static desc(text) {
	// 	if (typeof text === 'string') return YACLDescription.of(T.of(text));
	// 	else if (text instanceof TextComponent) return YACLDescription.of(T.of(text.formattedText));
	// 	else if (text instanceof TextMC) return YACLDescription.of(text);
	// 	else if (text instanceof YACLDescription) return text;
	// 	throw new Error('Invalid description type');
	// }
}
if (!global.ioi.Settings) {
	global.ioi.Settings = new SettingsClass();
	global.ioi.onGameUnload.add(() => {
		global.ioi.Settings.save();
	});
}
export default global.ioi.Settings;
