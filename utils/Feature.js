import Logger from '../Logger';
import Settings, { ValueOption } from '../Settings';

export default class Feature {
	constructor() {
		this.id = null;
		this.ioi = null;
		this.enabled = false;

		this.events = new Set();
		this.dynamicEvents = new Set();
		this.settingIds = new Set();
	}
	initSettings() {}
	onEnable() {}
	_onEnable() {
		this.enabled = true;
		this.initSettings();
		this.onEnable();
	}
	onDisable() {}
	_onDisable() {
		this.events.forEach((e) => {
			e.disable();
		});
		this.onDisable();
		this.events.clear();
		this.dynamicEvents.clear();
		this.settingIds.forEach((id) => Settings.removeOption(id));
		this.settingIds.clear();
		this.enabled = false;
	}
	addSetting(id) {
		this.settingIds.add(id);
	}
	//#region Events
	register(type, func) {
		const event = new Event(type, func, this);
		this.events.add(event);
		return event;
	}
	registerChat(criteria, func, triggerIfCanceled = true) {
		const event = new Event('chat', func, this);
		event.trigger.setChatCriteria(criteria);
		this.events.add(event);
		return event;
	}
	registerCommand(name, func, completions = undefined, aliases = []) {
		const event = new Event('command', func, this);
		if (completions) event.trigger.setTabCompletions(completions);
		event.trigger.setName(name, true);
		if (aliases) event.trigger.setAliases(...aliases);
		this.events.add(event);
		return event;
	}
	registerPacketReceived(packetClass, func) {
		const event = new Event('packetReceived', func, this);
		if (packetClass) event.trigger.setFilteredClasses(Array.isArray(packetClass) ? packetClass : [packetClass]);
		this.events.add(event);
		return event;
	}
	registerPacketSent(packetClass, func) {
		const event = new Event('packetSent', func, this);
		if (packetClass) event.trigger.setFilteredClasses(Array.isArray(packetClass) ? packetClass : [packetClass]);
		this.events.add(event);
		return event;
	}
	registerRenderBlockEntity(filterClasses, func) {
		const event = new Event('renderBlockEntity', func, this);
		if (packetClass) event.trigger.setFilteredClasses(Array.isArray(filterClasses) ? filterClasses : [filterClasses]);
		this.events.add(event);
		return event;
	}
	registerRenderEntity(filterClasses, func) {
		const event = new Event('renderEntity', func, this);
		if (packetClass) event.trigger.setFilteredClasses(Array.isArray(filterClasses) ? filterClasses : [filterClasses]);
		this.events.add(event);
		return event;
	}
	registerSoundPlay(criteria = undefined, func) {
		const event = new Event('soundPlay', func, this);
		if (criteria) event.trigger.setCriteria(criteria);
		this.events.add(event);
		return event;
	}
	registerStep(isFps, interval, func) {
		const event = new Event('step', func, this);
		isFps ? event.trigger.setFps(interval) : event.trigger.setDelay(interval);
		this.events.add(event);
		return event;
	}
	//#endregion
}

class Event {
	constructor(type, func, feat) {
		this.type = type;
		this.func = func;
		this.feat = feat;

		this.enabled = true;
		this.isDynamic = false;

		this.trigger = register(type, (...args) => {
			try {
				if (!feat.enabled || !feat.ioi.enabled) return;
				// if (feat.ioi.recordingPerformanceUsage) feat.ioi.startRecordingPerformance(feat.id, type);
				let start = Date.now();
				func.call(feat, ...(args || []));
				let time = Date.now() - start;
				if (time > feat.ioi.longEventTime) Logger.warn(`[Lag] Long event triggered [${time}ms] (${feat.id}/${type})`);
				// if (feat.ioi.recordingPerformanceUsage) feat.ioi.stopRecordingPerformance(feat.id, type);
			} catch (e) {
				Logger.error(`Error in ${feat.id}/${type} event:`);
				Logger.error(JSON.stringify(e, undefined, 2));
				Logger.warn(e.stack);
				Logger.report(e);
			}
		});
		this.conditions = new Set();
	}
	when(...conditions) {
		if (!this.isDynamic) this.feat.dynamicEvents.add(this);
		this.isDynamic = true;
		conditions.forEach((condition) => {
			if (typeof condition === 'function') {
				this.conditions.add(condition);
				if (!condition()) this.unregister();
			} else if (condition instanceof ValueOption) {
				if (!Settings.getValue(condition.id)) this.unregister();
				this.conditions.add(() => Settings.getValue(condition.id));
			} else {
				Logger.error(`Invalid condition type: ${condition}`);
			}
		});
		return this;
	}
	register() {
		this.enabled = true;
		this.trigger.register();
		return this;
	}
	unregister() {
		this.enabled = false;
		this.trigger.unregister();
		return this;
	}
	disable() {
		this.trigger.unregister();
		this.trigger.setMethod(() => {});
		this.enabled = false;
		this.feat.events.delete(this);
		if (this.isDynamic) this.feat.dynamicEvents.delete(this);
	}
}
