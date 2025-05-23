import { Option } from '../settings/Options';
import Logger from '../utils/Logger';

const LogType = Java.type('com.chattriggers.ctjs.engine.LogType');

class Events {
	constructor() {
		this.events = new Set();
		this.dynamicEvents = new Set();

		register('step', () => {
			this.dynamicEvents.forEach((event) => {
				let enabled = true;
				event.conditions.forEach((func) => {
					if (!func()) enabled = false;
				});
				if (enabled) event.register();
				else event.unregister();
			});
		}).setDelay(5);
	}
	addDynamic(event) {
		this.dynamicEvents.add(event);
	}
	addEvent(event) {
		this.events.add(event);
	}
	unregisterAll() {
		this.events.forEach((event) => {
			event.enabled = false;
			event.unregister();
		});
	}
}
if (!global.ioi.Events) {
	global.ioi.Events = new Events();
	global.ioi.onGameUnload.add(() => {
		global.ioi.Events.unregisterAll();
	});
}
export default global.ioi.Events;

export class Event {
	constructor(type, func) {
		this.enabled = true;
		this.conditions = new Set();
		this.trigger = register(type, (...args) => {
			if (!this.enabled) return;
			try {
				func.call(this, ...(args || []));
			} catch (e) {
				Logger.error(`Error in ${type} event:`);
				Logger.error(JSON.stringify(e, undefined, 2));
				if (e.stack) Logger.warn(e.stack);
				throw e;
			}
		});
		global.ioi.Events.addEvent(this);
		this.register();
	}
	when(...funcs) {
		funcs.forEach((func) => {
			if (func instanceof Option) {
				func.addListener((value) => {
					if (value) this.register();
					else this.unregister();
				});
			} else if (typeof func === 'function') {
				global.ioi.Events.addDynamic(this);
				this.conditions.add(func);
				if (!func()) this.unregister();
			}
		});
		this.register();
		return this;
	}
	unregister() {
		this.trigger.unregister();
		this.enabled = false;
		return this;
	}
	register() {
		this.trigger.register();
		this.enabled = true;
		return this;
	}
}
export class ActionBarEvent extends Event {
	constructor(criteria, func, triggerIfCanceled = null) {
		super('actionBar', func);
		this.trigger.setChatCriteria(criteria);
		if (triggerIfCanceled) this.trigger.setPriority(triggerIfCanceled);
	}
}
export class ChatEvent extends Event {
	constructor(criteria, func, triggerIfCanceled = null) {
		super('chat', func);
		this.trigger.setChatCriteria(criteria);
		if (triggerIfCanceled) this.trigger.setPriority(triggerIfCanceled);
	}
}
export class CommandEvent extends Event {
	constructor(name, func, completions = undefined, aliases = []) {
		super('command', func);
		this.trigger.setName(name, true);
		if (completions) this.trigger.setTabCompletions(completions);
		if (aliases) this.trigger.setAliases(...aliases);
	}
}
export class PacketReceivedEvent extends Event {
	constructor(packetClass, func) {
		super('packetReceived', func);
		if (packetClass) this.trigger.setFilteredClasses(Array.isArray(packetClass) ? packetClass : [packetClass]);
	}
}
export class PacketSentEvent extends Event {
	constructor(packetClass, func) {
		super('packetSent', func);
		if (packetClass) this.trigger.setFilteredClasses(Array.isArray(packetClass) ? packetClass : [packetClass]);
	}
}
export class RenderBlockEntityEvent extends Event {
	constructor(filterClasses, func) {
		super('renderBlockEntity', func);
		if (packetClass) this.trigger.setFilteredClasses(Array.isArray(filterClasses) ? filterClasses : [filterClasses]);
	}
}
export class RenderEntityEvent extends Event {
	constructor(filterClasses, func) {
		super('renderEntity', func);
		this.trigger.setFilteredClasses(Array.isArray(filterClasses) ? filterClasses : [filterClasses]);
	}
}
export class SoundPlayEvent extends Event {
	constructor(criteria = undefined, func) {
		super('soundPlay', func);
		if (criteria) this.trigger.setCriteria(criteria);
	}
}
export class StepEvent extends Event {
	constructor(isFps, interval, func) {
		super('step', func);
		isFps ? this.trigger.setFps(interval) : this.trigger.setDelay(interval);
	}
}
