//#region Imports
/**
 * @typedef {'Double'|'Float'|'Integer'|'Long'} AllNum
 * @typedef {function} Func
 * @typedef {boolean} Bool
 */
const YetAnotherConfigLib = Java.type('dev.isxander.yacl3.api.YetAnotherConfigLib');
const YACLCategory = Java.type('dev.isxander.yacl3.api.ConfigCategory');
const YACLGroup = Java.type('dev.isxander.yacl3.api.OptionGroup');
const YACLDescription = Java.type('dev.isxander.yacl3.api.OptionDescription');

const YACLOption = Java.type('dev.isxander.yacl3.api.Option');
const YACLButtonOption = Java.type('dev.isxander.yacl3.api.ButtonOption');
const YACLLabelOption = Java.type('dev.isxander.yacl3.api.LabelOption');
const YACLListOption = Java.type('dev.isxander.yacl3.api.ListOption');

const TickBoxControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.TickBoxControllerBuilder');
const BooleanControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.BooleanControllerBuilder');
const IntegerSliderControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.IntegerSliderControllerBuilder');
const LongSliderControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.LongSliderControllerBuilder');
const FloatSliderControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.FloatSliderControllerBuilder');
const DoubleSliderControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.DoubleSliderControllerBuilder');
const StringControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.StringControllerBuilder');
const IntegerFieldControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.IntegerFieldControllerBuilder');
const LongFieldControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.LongFieldControllerBuilder');
const FloatFieldControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.FloatFieldControllerBuilder');
const DoubleFieldControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.DoubleFieldControllerBuilder');
const ColorControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.ColorControllerBuilder');
const CyclingListControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.CyclingListControllerBuilder');
const EnumControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.EnumControllerBuilder');
const EnumDropdownControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.EnumDropdownControllerBuilder');
const ItemControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.ItemControllerBuilder');

const TextMC = Java.type('net.minecraft.text.Text');
const Double = Java.type('java.lang.Double');
const Float = Java.type('java.lang.Float');
const Integer = Java.type('java.lang.Integer');
const Long = Java.type('java.lang.Long');

const JavaNumbers = {
	Double,
	Float,
	Integer,
	Long,
};

const Color = Java.type('java.awt.Color');

import Logger from './Logger';
//#endregion

function f(str) {
	return str.replaceAll(' ', '_').toLowerCase();
}

function toText(text) {
	if (typeof text === 'string') return TextMC.of(text);
	else if (text instanceof TextComponent) return TextMC.of(text.formattedText);
	else if (text instanceof TextMC) return text;
	throw new Error('Invalid name type for: ' + text);
}
function toDesc(text) {
	if (typeof text === 'string') return YACLDescription.of(TextMC.of(text));
	else if (text instanceof TextComponent) return YACLDescription.of(TextMC.of(text.formattedText));
	else if (text instanceof TextMC) return YACLDescription.of(text);
	else if (text instanceof YACLDescription) return text;
	throw new Error('Invalid description type for: ' + text);
}

class SettingsClass {
	constructor() {
		this.options = new Map();
		this.groups = new Map();
		this.categories = new Map();
	}
	addOption(option) {
		if (this.options.has(option.id)) return Logger.warn('[Settings] Option with id ' + option.id + ' already exists, skipping');
		Logger.debug('[Settings] Adding Option: ' + option.id);
		this.options.set(option.id, option);
	}
	removeOption(id) {
		const option = this.options.get(id);
		if (!option) return Logger.warn('[Settings] Option with id ' + id + ' does not exist, skipping removal');
		Logger.debug('[Settings] Removing Option: ' + id);
		this.options.delete(id);

		let lastOfCategory = true,
			lastOfGroup = true;
		this.options.forEach((opt) => {
			if (opt.category === option.category) {
				lastOfCategory = false;
				if (opt.group === option.group) lastOfGroup = false;
			}
		});
		if (lastOfGroup) {
			Logger.debug(`[Settings] Removing Empty Group: ${option.category}/${option.group}`);
			this.groups.delete(`${f(option.category)}/${f(option.group)}`);
		}
		if (lastOfCategory) {
			Logger.debug(`[Settings] Removing Empty Category: ${option.category}`);
			this.categories.delete(f(option.category));
		}
	}
	getOption(id) {
		return this.options.get(id);
	}
	getValue(optionId) {
		if (typeof optionId !== 'string') optionId = optionId.id;
		const option = this.options.get(optionId);
		if (!option) {
			Logger.warn(`[Settings] Option with id ${optionId} does not exist, returning undefined`);
			console.dir(optionId);
			return undefined;
		}
		if (option.hasOwnProperty('value')) {
			return option.value;
		} else return undefined;
	}
	getOrUpdateGroup(category, group, description = '') {
		const id = `${f(category)}/${f(group)}`;
		if (!this.groups.has(id) || description) {
			this.groups.set(id, { name: group, category, group, description });
		}
		return this.groups.get(id);
	}
	getOrUpdateCategory(category, description = '') {
		const id = f(category);
		if (!this.categories.has(id) || description) {
			this.categories.set(id, { name: category, category, description });
		}
		return this.categories.get(id);
	}
	build(parent = null) {
		const builder = YetAnotherConfigLib.createBuilder().title(toText('IOI Settings'));
		this.categories.forEach((category) => {
			const categoryBuilder = YACLCategory.createBuilder().name(toText(category.name)).tooltip(toText(category.description));
			this.groups.forEach((group) => {
				if (group.category !== category.name) return;
				const groupBuilder = YACLGroup.createBuilder().name(toText(group.name)).description(toDesc(group.description));
				let hasOptions = false;
				this.options.forEach((option) => {
					if (option.category !== category.name || option.group !== group.name) return;
					hasOptions = true;
					groupBuilder.option(option.build());
				});
				if (!hasOptions) Logger.error(`No options found for group ${group.name} in category ${category.name}`);
				categoryBuilder.group(groupBuilder.build());
			});
			this.options.forEach((option) => {
				Logger.debug(`${option.id} - ${option.category} - ${option.group}`);
				if (option.category !== category || option.group) return;
				categoryBuilder.option(option.build());
			});
			builder.category(categoryBuilder.build());
		});
		return builder.build().generateScreen(parent);
	}

	open() {
		new Thread(() => {
			try {
				Client.currentGui.set(this.build());
			} catch (e) {
				Logger.error('Error building config gui');
				Logger.error(JSON.stringify(e, null, 2));
				Logger.warn(e.stack);
			}
		}).start();
	}
	save() {}
}

if (!global.ioi.Settings) {
	global.ioi.Settings = new SettingsClass();
	global.ioi.onGameUnload.add(global.ioi.Settings.save);
}
const settings = global.ioi.Settings;
export default global.ioi.Settings;

class Option {
	constructor(feature, { id, name, description, category, group }) {
		this.feature = feature;
		this.id = id || `${f(category)}/${group ? f(group) + '/' : ''}${f(name)}`;
		this.name = name;
		this.description = description;
		this.category = category;
		this.group = group;
		this.listeners = new Set();
		this.feature?.addSetting(this.id);
		settings.addOption(this);
		settings.getOrUpdateCategory(category);
		if (group) settings.getOrUpdateGroup(category, group);
	}
	addListener(func) {
		this.listeners.add(func);
	}
	removeListener(func) {
		this.listeners.delete(func);
	}
	triggerListeners(...args) {
		this.listeners.forEach((func) => func.call(this.feature, ...args));
	}
	disable() {}
}
export class ValueOption extends Option {
	constructor(feature, { id, name, description, category, group, value }) {
		super(feature, { id, name, description, category, group, value });
		this.defaultValue = value;
		this.value = value;
	}
	simpleBind() {
		return [
			this.defaultValue,
			() => this.value,
			(newValue) => {
				this.value = newValue;
				this.triggerListeners(newValue);
			},
		];
	}
}
export class CheckBoxSetting extends ValueOption {
	constructor(feature, { id = '', name, description, category, group, value = false }) {
		super(feature, { id, name, description, category, group, value });
		return this.id;
	}
	build() {
		return YACLOption.createBuilder()
			.name(toText(this.name))
			.description(toDesc(this.description))
			.binding(...this.simpleBind())
			.controller(TickBoxControllerBuilder.create)
			.build();
	}
}
export class ToggleSetting extends ValueOption {
	constructor(feature, { id = '', name, description, category, group, value = false, valueFormatter = null }) {
		super(feature, { id, name, description, category, group, value });
		this.valueFormatter = valueFormatter;
		return this.id;
	}
	build() {
		return YACLOption.createBuilder()
			.name(toText(this.name))
			.description(toDesc(this.description))
			.binding(...this.simpleBind())
			.controller((option) => {
				const builder = BooleanControllerBuilder.create(option);
				if (this.valueFormatter) builder.formatValue(this.valueFormatter);
				return builder;
			})
			.build();
	}
}
export class TextSetting extends ValueOption {
	constructor(feature, { id = '', name, description, category, group, value = '' }) {
		super(feature, { id, name, description, category, group, value });
		return this.id;
	}
	build() {
		return YACLOption.createBuilder()
			.name(toText(this.name))
			.description(toDesc(this.description))
			.binding(...this.simpleBind())
			.controller(StringControllerBuilder.create)
			.build();
	}
}
export class ButtonSetting extends Option {
	constructor(feature, { id, name, description, category, group, action }) {
		super(feature, { id, name, description, category, group });
		this.action = action;
		return this.id;
	}
	build() {
		return YACLButtonOption.createBuilder()
			.name(toText(this.name))
			.description(toDesc(this.description))
			.action(
				JavaAdapter(Java.type('java.util.function.BiConsumer'), {
					accept: (screen, opt) => {
						this.action.call(this.feature, screen, opt);
					},
				})
			)

			.build();
	}
}
export class KeyBindSetting extends ValueOption {}
