//#region Imports
/**
 * @typedef {'Double'|'Float'|'Integer'|'Long'} AllNum
 * @typedef {function} Func
 * @typedef {boolean} Bool
 */
import Settings from './Settings';
import Logger from '../utils/Logger';
import * as Controller from './Controllers';

const YACLCategory = Java.type('dev.isxander.yacl3.api.ConfigCategory');
const YACLGroup = Java.type('dev.isxander.yacl3.api.OptionGroup');
const YACLDescription = Java.type('dev.isxander.yacl3.api.OptionDescription');

const YACLOption = Java.type('dev.isxander.yacl3.api.Option');
const YACLButtonOption = Java.type('dev.isxander.yacl3.api.ButtonOption');
const YACLLabelOption = Java.type('dev.isxander.yacl3.api.LabelOption');
const YACLListOption = Java.type('dev.isxander.yacl3.api.ListOption');

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
//#endregion

function toCamelCase(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
		return index === 0 ? word.toLowerCase() : word.toUpperCase();
	});
}
function toSnakeCase(str) {
	return str
		.replace(/([a-z])([A-Z])/g, '$1_$2')
		.replace(/[\s_]+/g, '_')
		.toLowerCase();
}
function formatText(text) {
	if (typeof text === 'string') return TextMC.of(text);
	else if (text instanceof TextComponent) return TextMC.of(text.formattedText);
	else if (text instanceof TextMC) return text;
	throw new Error('Invalid name type');
}
function formatDesc(text) {
	if (typeof text === 'string') return YACLDescription.of(TextMC.of(text));
	else if (text instanceof TextComponent) return YACLDescription.of(TextMC.of(text.formattedText));
	else if (text instanceof TextMC) return YACLDescription.of(text);
	else if (text instanceof YACLDescription) return text;
	throw new Error('Invalid description type');
}

export class Category {
	constructor(category, description = '') {
		const existingCategory = Settings.categorys.find((e) => e.category === category);
		// existingCategory ? Logger.debug('Settings: Category Exists - ' + this.getId()) : Logger.debug('Settings: New: ├(C) ' + category);
		if (existingCategory) return existingCategory;
		this.name = category;
		this.category = category;
		this.description = description;

		Settings.categorys.add(this);
		this.builder = YACLCategory.createBuilder().name(formatText(category)).tooltip(formatText(description));
	}
	getId() {
		return toSnakeCase(this.category);
	}
	build() {
		// Logger.debug('Settings: Build: ├(C) ' + this.name);
		Settings.options.forEach((option) => {
			if (option.category !== this.category || option.group) return;
			this.builder.option(option.build());
		});
		Settings.groups.forEach((group) => {
			if (group.category !== this.name) return;
			this.builder.group(group.build());
		});
		return this.builder.build();
	}
}
export class Group {
	constructor(group, category, description = '') {
		Settings.categorys.find((e) => e.category === category) ?? new Category(category, description);

		const existingGroup = Settings.groups.find((e) => e.group === group && e.category === category);
		// existingGroup ? Logger.debug('Settings: Group Exists - ' + this.getId()) : Logger.debug('Settings: New: │ ├(G) ' + group);
		if (existingGroup) return existingGroup;

		this.name = group;
		this.group = group;
		this.category = category;
		this.description = description;
		Settings.groups.add(this);

		this.builder = YACLGroup.createBuilder().name(formatText(group)).description(formatDesc(description));
	}
	getId() {
		return toSnakeCase(`${this.category}/${this.group}`);
	}
	build() {
		// Logger.debug('Settings: Build: │ ├(G) ' + this.name);
		Settings.options.forEach((option) => {
			if (option.category !== this.category || option.group !== this.group) return;
			this.builder.option(option.build());
		});
		return this.builder.build();
	}
}
export class Option {
	constructor(name, group, category, description = '') {
		if (category) Settings.categorys.find((e) => e.category === category) ?? new Category(category);
		if (group) Settings.groups.find((e) => e.group === group && e.category === category) ?? new Group(group, category);

		const existingOption = Settings.options.find((e) => e.name === name && e.group === group && e.category === category);
		// existingOption ? Logger.debug('Settings: Option Exists - ' + this.getId()) : Logger.debug(`Settings: New: │ ${group ? '│ ├' : '├───'}(O) ` + name);
		if (existingOption) return existingOption;

		this.name = name;
		this.group = group;
		this.category = category;
		this.description = description;
		Settings.options.add(this);

		this.listeners = new Set();
		this.isBuilder = false;
	}
	addListener(func) {
		Logger.debug('Settings: new Listener      - ' + this.getId());
		this.listeners.add(func);
		return this;
	}
	removeListener(func) {
		Logger.debug('Settings: remove Listener   - ' + this.getId());
		this.listeners.delete(func);
		return this;
	}
	triggerListeners(...args) {
		Logger.debug('Settings: trigger Listeners - ' + this.getId());
		Logger.debug('Settings: Value: ' + this.value);
		this.listeners.forEach((func) => func(...args));
	}
	createBuilder(clazz) {
		this.isBuilder = true;
		this.builder = clazz.createBuilder();
		return this.builder;
	}
	simpleBinding() {
		if (!this.builder) throw new Error('Settings: Option not created - ' + this.getId());
		this.builder.binding(
			this.value,
			() => this.value,
			(newValue) => {
				this.value = newValue;
				this.triggerListeners(newValue);
			}
		);
	}
	getId() {
		return toSnakeCase(`${this.category}/${this.group}/${this.name}`);
	}
	build() {
		// Logger.debug(`Settings: Build: │ ${this.group ? '│ ├' : '├───'}(O) ` + this.name);
		if (this.isBuilder) return this.builder.build();
		else return this.builder;
	}
}

//#region Options
export class TickBoxOption extends Option {
	constructor({ value, name, description = '', group = '', category = 'general' }) {
		super(name, group, category, description);
		this.value = value;
		this.createBuilder(YACLOption).name(formatText(name)).description(formatDesc(description));
		this.simpleBinding();
		this.builder.controller(Controller.tickBox());
	}
}
export class ToggleOption extends Option {
	constructor({ value, name, description = '', group = '', category = 'general', coloured = false, valueFormatter = null }) {
		super(name, group, category, description);
		this.value = value;
		this.createBuilder(YACLOption).name(formatText(name)).description(formatDesc(description));
		this.simpleBinding();
		this.builder.controller(Controller.textSwitch(valueFormatter));
	}
}
export class SliderOption extends Option {
	constructor({ value, name, description = '', group = '', category = 'general', min = 0, max = 1, step = 1, valueFormatter = null }) {
		const func = Controller['slider' + type];
		if (!func) return;

		super(name, group, category, description);
		this.value = value;
		this.createBuilder(YACLOption).name(formatText(name)).description(formatDesc(description));
		this.simpleBinding();

		this.builder.controller(func(min, max, step, valueFormatter));
		// this.builder.controller((opt) => {
		// 	const controller = YACLSliders[type].create(opt);
		// 	console.log(type);
		// 	controller.range(new Integer(min), new Integer(max)).step(new Integer(step));
		// 	if (valueFormatter) controller.valueFormatter(valueFormatter);
		// 	return controller;
		// });
	}
}
export class TextOption extends Option {
	constructor({ value, name, description = '', group = '', category = 'general' }) {
		super(name, group, category, description);
		this.value = value;
		this.createBuilder(YACLOption).name(formatText(name)).description(formatDesc(description));
		this.simpleBinding();
		this.builder.controller(Controller.stringField());
	}
}
export class ColorOption extends Option {
	constructor({ value, name, description = '', group = '', category = 'general', alpha = false }) {
		super(name, group, category, description);
		this.value = value ? value : alpha ? new Color(0, 0, 0, 1) : new Color(0, 0, 0);
		this.createBuilder(YACLOption).name(formatText(name)).description(formatDesc(description));
		this.simpleBinding();
		this.builder.controller(Controller.colorPicker(alpha));
	}
}
export class NumberOption extends Option {
	constructor({ value, name, description = '', group = '', category = 'general', type = 'Integer', min = 0, max = 1, valueFormatter = null }) {
		const numberController = Controller['numberField' + type];
		if (!numberController) return;
		super(name, group, category, description);
		this.value = value;
		this.createBuilder(YACLOption).name(formatText(name)).description(formatDesc(description));
		this.simpleBinding();
		this.builder.controller(numberController(min, max, valueFormatter));
		// this.builder.controller((opt) => {
		// 	const controller = YACLNumbers[type].create(opt);
		// 	controller.range(new Integer(min), new Integer(max));
		// 	if (valueFormatter) controller.valueFormatter(valueFormatter);
		// 	return controller;
		// });
	}
}
export class ButtonOption extends Option {
	constructor({ action, name, description = '', group = '', category = 'general', buttonText = 'Button', enabled = true }) {
		super(name, group, category, description);
		this.action = action;
		this.buttonText = buttonText;
		this.enabled = enabled;
		this.createBuilder(YACLButtonOption).name(formatText(name)).description(formatDesc(description)).text(formatText(buttonText));
		this.builder.action((screen, opt) => {
			this.triggerListeners(screen, opt);
			this.action(screen, opt);
		});
		this.builder.available(this.enabled);
	}
	enable() {
		this.enabled = true;
		this.builder.available(true);
	}
	disable() {
		this.enabled = false;
		this.builder.available(false);
	}
}
export class LableOption extends Option {
	constructor({ name, description = '', group = '', category = 'general' }) {
		super(name, group, category, description);
		this.createBuilder(YACLLabelOption).line(formatText(name)).line(formatText(description));
	}
}
export class ListOption extends Option {
	constructor({ value, name, description = '', group = '', category = 'general', enabled = true, min = 0, max = 100, flags = [], collapsed = false }) {
		super(name, group, category, description);
		this.createBuilder(YACLListOption).name(formatText(name)).description(formatDesc(description));
		this.builder.available(enabled).minimumNumberOfEntries(JavaInt(min)).maximumNumberOfEntries(JavaInt(max)).collapsed(collapsed);
		if (flags) this.builder.flags(flags);
		// this.simpleBinding();
	}
}
//#endregion
