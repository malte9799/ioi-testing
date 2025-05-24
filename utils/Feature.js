export default class Feature {
	constructor() {
		this.id = null;
		this.ioi = null;
		this.enabled = false;

		this.events = new Set();
	}
	onEnable() {}
	_onEnable() {
		this.enabled = true;
		this.onEnable();
	}
	onDisable() {}
	_onDisable() {
		this.events.forEach((e) => {
			e.disable();
		});
		this.onDisable();
		this.events.clear();
		this.enabled = false;
	}
	//#region Events
	register(type, func) {
		const event = new Event(type, func);
		this.events.add(event);
		return event;
	}
	registerChat(criteria, func, triggerIfCanceled = true) {
		const event = new Event('chat', func);
		event.trigger.setChatCriteria(criteria);
		this.events.add(event);
		return event;
	}
	registerCommand(name, func, completions = undefined, aliases = []) {
		const event = new Event('command', func);
		if (completions) event.trigger.setTabCompletions(completions);
		event.trigger.setName(name, true);
		if (aliases) event.trigger.setAliases(...aliases);
		this.events.add(event);
		return event;
	}
	registerPacketReceived(packetClass, func) {
		const event = new Event('packetReceived', func);
		if (packetClass) event.trigger.setFilteredClasses(Array.isArray(packetClass) ? packetClass : [packetClass]);
		this.events.add(event);
		return event;
	}
	registerPacketSent(packetClass, func) {
		const event = new Event('packetSent', func);
		if (packetClass) event.trigger.setFilteredClasses(Array.isArray(packetClass) ? packetClass : [packetClass]);
		this.events.add(event);
		return event;
	}
	registerRenderBlockEntity(filterClasses, func) {
		const event = new Event('renderBlockEntity', func);
		if (packetClass) event.trigger.setFilteredClasses(Array.isArray(filterClasses) ? filterClasses : [filterClasses]);
		this.events.add(event);
		return event;
	}
	registerRenderEntity(filterClasses, func) {
		const event = new Event('renderEntity', func);
		if (packetClass) event.trigger.setFilteredClasses(Array.isArray(filterClasses) ? filterClasses : [filterClasses]);
		this.events.add(event);
		return event;
	}
	registerSoundPlay(criteria = undefined, func) {
		const event = new Event('soundPlay', func);
		if (criteria) event.trigger.setCriteria(criteria);
		this.events.add(event);
		return event;
	}
	registerStep(isFps, interval, func) {
		const event = new Event('step', func);
		isFps ? event.trigger.setFps(interval) : event.trigger.setDelay(interval);
		this.events.add(event);
		return event;
	}
	//#endregion
}

class Event {
	constructor(type, func) {
		this.trigger = register(type, func);
		this.conditions = new Set();
	}
	when(...funcs) {
		funcs.forEach((func) => {
			if (typeof func === 'function') {
				this.conditions.add(func);
				if (!func()) this.unregister();
			}
		});
		return this;
	}
	register() {
		this.trigger.register();
		return this;
	}
	unregister() {
		this.trigger.unregister();
		return this;
	}
	disable() {
		this.trigger.unregister();
		this.trigger.setMethod(() => {});
	}
}
