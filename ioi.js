/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

global.ioi = { onGameUnload: new Set(), command: new Map() };
try {
	throw new Error();
} catch (e) {
	global.ioi.metadata = JSON.parse(FileLib.read(e.stack.match(/ChatTriggers\/modules\/(.+?)\//)?.[1], 'metadata.json'));
}
import Logger from './Logger';
import TabCompletion from './utils/TabCompletion';
import Settings from './Settings';
import Updater from './UpdaterNew';
// if (Logger.isDev()) Console.show();

const StandardWatchEventKinds = Java.type('java.nio.file.StandardWatchEventKinds');
const FileSystems = Java.type('java.nio.file.FileSystems');
const Paths = Java.type('java.nio.file.Paths');
const File = Java.type('java.io.File');
const System = Java.type('java.lang.System');

//#region  RequireNoCache
const CTRequireClass = Java.type('com.chattriggers.ctjs.internal.engine.JSLoader$CTRequire');
const UrlModuleSourceProvider = Java.type('org.mozilla.javascript.commonjs.module.provider.UrlModuleSourceProvider');
const UrlModuleSourceProviderInstance = new UrlModuleSourceProvider(null, null);
const StrongCachingModuleScriptProviderClass = Java.type('org.mozilla.javascript.commonjs.module.provider.StrongCachingModuleScriptProvider');
let StrongCachingModuleScriptProvider = new StrongCachingModuleScriptProviderClass(UrlModuleSourceProviderInstance);
let CTRequire = new CTRequireClass(StrongCachingModuleScriptProvider);

let shouldRequireForceNoCache = false;
function RequireNoCache(place) {
	if (Logger.isDev() || shouldRequireForceNoCache) {
		StrongCachingModuleScriptProvider = new StrongCachingModuleScriptProviderClass(UrlModuleSourceProviderInstance);
		CTRequire = new CTRequireClass(StrongCachingModuleScriptProvider);
		return CTRequire(place);
	} else {
		return require(place);
	}
}
//#endregion
//#region NonPooledThread
let Executors = Java.type('java.util.concurrent.Executors');
class NonPooledThread {
	constructor(fun) {
		this.fun = fun;
		this.executor = Executors.newSingleThreadExecutor();
	}
	start() {
		this.executor.execute(this.fun);
	}
}
//#endregion
//#region Mixins
import { ClientPlayerInteractionManager_breakBlock, BlockItem_place_head, BlockItem_place_tail } from './mixins.js';
const onBlockBreakTrigger = createCustomTrigger('blockBreak');
ClientPlayerInteractionManager_breakBlock.attach((instance, cir, pos) => {
	if (!World.isLoaded()) return;
	const block = World.getBlockAt(new BlockPos(pos));
	onBlockBreakTrigger.trigger(block);
});

const onBlockplaceTrigger = createCustomTrigger('blockPlace');
let placedItem;
BlockItem_place_head.attach((instance, cir, itemPlacementContext) => {
	if (!World.isLoaded()) return;
	placedItem = new Item(itemPlacementContext.getStack());
});
BlockItem_place_tail.attach((instance, cir, itemPlacementContext) => {
	if (!World.isLoaded()) return;
	const pos = itemPlacementContext.getBlockPos();
	onBlockplaceTrigger.trigger(World.getBlockAt(new BlockPos(pos)), placedItem || new Item(itemPlacementContext.getStack()));
});
//#endregion

class IOI {
	constructor() {
		this.enabled = false;
		this.module;
		try {
			throw new Error();
		} catch (e) {
			this.module = e.stack.match(/ChatTriggers\/modules\/(.+?)\//)?.[1];
		}
		global.ioi.module = this.module;
		this.metadata = JSON.parse(FileLib.read(this.module, 'metadata.json'));
		this.moduleDir = ChatTriggers.MODULES_FOLDER + '/' + this.module;

		this.events = new Set();
		this.features = new Map();
		this.featureFiles = new Set();

		// Dynamic Events
		this.events.add(
			register('step', () => {
				this.features.forEach((feature) => {
					if (!feature.class.enabled) return;
					feature.class.dynamicEvents.forEach((event) => {
						let enabled = true;
						event.conditions.forEach((func) => {
							if (enabled && !func()) enabled = false;
						});
						if (enabled) event.register();
						else event.unregister();
					});
				});
			}).setDelay(5)
		);

		register('command', (...args) => {
			switch (args[0]) {
				case 'feature':
					if (args[1] == 'list') {
						Logger.info('Feature list:');
						Object.keys(this.featureFiles).forEach((e) => Logger.info(e));
					}
					if (args[1] == 'load') {
						if (this.loadFeature(args[2])) Logger.chat(`Feature '${args[2]}' loaded`);
						else Logger.chat("Couldn't load feature " + args[2]);
					}
					if (args[1] == 'unload') {
						if (this.unloadFeature(args[2])) Logger.chat(`Feature '${args[2]}' unloaded`);
						else Logger.chat("Couldn't unload feature " + args[2]);
					}
					if (args[1] == 'reload') {
						if (this.unloadFeature(args[2])) if (this.loadFeature(args[2])) return Logger.chat(`Feature '${args[2]}' reloaded`);
						Logger.chat("Couldn't reload feature " + args[2]);
					}
					break;
				case 'load':
					if (this.enabled) Logger.warn('IOI is already enabled');
					else this.loadMain();
					break;
				case 'unload':
					if (!this.enabled) Logger.warn('IOI is not enabled');
					else this.unloadMain();
					break;
				case 'reload':
					if (!this.enabled) Logger.warn('IOI is not enabled');
					else this.unloadMain();
					this.loadMain();
					break;
				// case 'laginfo':
				// 	if (args[1] == 'full') this.loadPerformanceData();
				// 	else this.loadPerformanceDataFast();
				// 	break;
				case 'settings':
					Settings.open();
					break;
			}
		})
			.setTabCompletions(
				TabCompletion({
					feature: {
						load: [],
						unload: () => Array.from(this.features.keys()),
						reload: () => Array.from(this.features.keys()),
						list: [],
					},
					// laginfo: ['full', ''],
					load: [],
					unload: [],
					reload: [],
					settings: [],
				})
			)
			.setName('ioi');

		this.loadMain();
		global.ioi.onGameUnload.add(() => {
			this.unloadMain();
		});
	}

	loadMain() {
		this.enabled = true;
		const start = Date.now();
		Logger.info('Loading IOI...');
		if (Logger.isDev()) this.loadWatcher();
		this.loadFeatureFiles();
		this.loadAllFeatures();
		Logger.info(`IOI Loaded. This took ${((Date.now() - start) / 1000).toFixed(2)}s`);
	}
	unloadMain() {
		this.enabled = false;
		const start = Date.now();
		Logger.info('Unloading IOI...');

		if (Logger.isDev()) {
			this.watchers.clear();
			if (!this.watchService) return;
			try {
				this.watchService.close();
				this.watchService = undefined;
			} catch (e) {
				Logger.error(`Error closing WatchService: ${e}`);
			}
		}

		this.unloadAllFeatures();
		this.events.forEach((event) => {
			event.unregister();
			event.setMethod(() => {});
		});

		Logger.info(`IOI Unloaded. This took ${((Date.now() - start) / 1000).toFixed(2)}s`);
	}

	loadFeatureFiles() {
		const dir = new File(this.moduleDir + '/features');
		const result = new Set();

		function traverse(folder, parentPath = '') {
			const files = folder.listFiles();
			if (files == null) return;
			files.forEach((file) => {
				const fileName = file.getName();
				const filePath = parentPath ? `${parentPath}/${fileName}` : fileName;
				if (file.isDirectory()) traverse(file, filePath);
				else if (fileName.endsWith('.js')) result.add(filePath.slice(0, -3));
			});
		}
		traverse(dir);
		this.featureFiles = result;
		return result;
	}
	loadAllFeatures() {
		this.featureFiles.forEach((feature) => {
			this.loadFeature(feature);
		});
	}
	unloadAllFeatures() {
		this.features.forEach((_, feature) => {
			try {
				this.unloadFeature(feature);
			} catch (e) {
				Logger.error('Error unloading feature ' + feature);
				Logger.error(JSON.stringify(e, undefined, 2));
				Logger.warn(e.stack);
			}
		});
	}
	loadFeature(feature) {
		if (this.features.has(feature)) return Logger.warn(`Feature ${feature} is already loaded`);
		try {
			if (Logger.isDev()) this.addWatcher(feature);
			const loadedFeature = RequireNoCache('./features/' + feature + '.js');
			if (!loadedFeature.class) return false;
			this.features.set(feature, loadedFeature);
			loadedFeature.class.ioi = this;
			loadedFeature.class.id = feature;
			// this.addPerformanceTracking(loadedFeature.class);
			loadedFeature.class._onEnable();
			Logger.info(`■ Feature '${feature}' loaded`);
			return true;
		} catch (e) {
			Logger.error('Error loading feature ' + feature);
			Logger.warn(JSON.stringify(e, undefined, 2));
			Logger.warn(e.stack);
			return false;
		}
	}
	unloadFeature(feature) {
		if (!this.features.has(feature)) return Logger.warn(`Feature ${feature} is not loaded, cannot unload`);
		try {
			const loadedFeature = this.features.get(feature);
			loadedFeature.class._onDisable();
			this.features.delete(feature);
			Logger.info(`□ Feature '${feature}' unloaded`);
			return true;
		} catch (e) {
			Logger.error('Error unloading feature ' + feature);
			Logger.error(JSON.stringify(e, undefined, 2));
			Logger.warn(e.stack);
			return false;
		}
	}
	//#region Watcher
	loadWatcher() {
		if (!Logger.isDev()) return;
		Logger.debug('Loading watcher');
		this.watchers = new Set();
		this.watchService = FileSystems.getDefault().newWatchService();
		this.reloadingModules = new Set();
		this.reloadModuleTime = 0;

		new NonPooledThread(() => {
			Logger.debug('Watcher thread started');
			while (this.enabled) {
				try {
					key = this.watchService.take();
				} catch (e) {
					// InterruptedException or ClosedWatchServiceException
					if (this.enabled) Logger.warn(`Watcher thread interrupted: ${e}`);
					break;
				}
				key.pollEvents().forEach((event) => {
					const path = key.watchable().resolve(event.context().toString().slice(0, -3));
					if (path.getNameCount() <= 6) return;
					const feature = path.subpath(6, path.getNameCount()).toString().replace(/\\/g, '/');
					if (!this.features.has(feature) || this.reloadingModules.has(feature)) return;
					Logger.debug(`[Watcher] Change detected in '${feature}'`);
					this.reloadingModules.add(feature);
					this.reloadModuleTime = Date.now() + 100;
				});
				if (!key.reset()) {
					this.watchers.delete(key.watchable().toString());
				}
			}
			Logger.debug('[Watcher] Thread stopped');
		}).start();
		this.events.add(
			register('step', () => {
				if (this.reloadModuleTime === 0 || Date.now() - this.reloadModuleTime <= 0) return;
				this.reloadModuleTime = 0;
				this.reloadingModules.forEach((feature) => {
					this.unloadFeature(feature);
				});
				this.reloadingModules.forEach((feature) => {
					this.loadFeature(feature);
					Logger.chat(`🗘 Reloading '${feature}'`);
				});
				this.reloadingModules.clear();
			}).setFps(2)
		);
	}
	addWatcher(feature) {
		if (!Logger.isDev() || !this.watchService) return;
		const path = Paths.get(this.moduleDir, 'features', feature + '.js').getParent();
		if (this.watchers.has(path.toString())) return;
		this.watchers.add(path.toString());
		path.register(this.watchService, StandardWatchEventKinds.ENTRY_MODIFY), path;
		Logger.debug(`Now watching: ${this.module}/features/${feature.split('/').slice(0, -1).join('/')}`);
	}
	//#endregion
	//#region Performance
	// loadPerformanceDataFast() {
	// 	new Thread(() => {
	// 		this.loadEventLag(true);
	// 	}).start();
	// }
	// loadPerformanceData() {
	// 	new NonPooledThread(() => {
	// 		Logger.chat('Recording performance impact, this will take around 60 seconds to complete!');
	// 		shouldRequireForceNoCache = true;
	// 		let eventLagData = this.loadEventLag();
	// 		Logger.chat('ETA: 40s');
	// 		this.perfTrackingFeatures = true;
	// 		this.unloadMain();
	// 		this.loadMain();
	// 		Thread.sleep(1000);
	// 		let eventLagDataFull = this.loadEventLag();
	// 		this.perfTrackingFeatures = false;
	// 		this.unloadMain();
	// 		this.loadMain();
	// 		Thread.sleep(1000);
	// 		Logger.chat('ETA: 15s');
	// 		let ioiLagData = this.loadIoiLag();

	// 		let lagData = {
	// 			eventLagDataFull,
	// 			eventLagData,
	// 			ioiLagData,
	// 		};

	// 		shouldRequireForceNoCache = false;
	// 		Logger.chat('Done!');
	// 		Logger.error('------------------------------ LAGDATA ------------------------------');
	// 		Logger.info(JSON.stringify(lagData, undefined, 2));
	// 		this.performanceUsage = {};
	// 		this.flameGraphData = [];
	// 	}).start();
	// }
	// loadIoiLag() {
	// 	let framesWith = 0;
	// 	let framesWithOut = 0;
	// 	let event = register('renderWorld', () => {
	// 		framesWith++;
	// 	});

	// 	Thread.sleep(5000);
	// 	event.unregister();

	// 	this.unloadMain();
	// 	Thread.sleep(1000);
	// 	event = register('renderWorld', () => {
	// 		framesWithOut++;
	// 	});

	// 	Thread.sleep(5000);
	// 	event.unregister();

	// 	// ChatLib.chat(this.messagePrefix + "Soopy Lag:")
	// 	// ChatLib.chat("&eFps without Soopy: &7" + (framesWithOut / 5))
	// 	// ChatLib.chat("&eFps with Soopy: &7" + (framesWith / 5))

	// 	this.loadMain();

	// 	return {
	// 		fpsWith: framesWith / 5,
	// 		fpsWithout: framesWithOut / 5,
	// 	};
	// }
	// loadEventLag(sendMessage = false) {
	// 	this.recordingPerformanceUsage = true;
	// 	this.performanceUsage = {};
	// 	this.flameGraphData = [];
	// 	if (sendMessage) Logger.chat('Recording Event Lag...');

	// 	Thread.sleep(10000);

	// 	let totalMsGlobal = 0;
	// 	this.recordingPerformanceUsage = false;
	// 	if (sendMessage) {
	// 		Logger.chat('Event Lag:');
	// 		Object.keys(this.performanceUsage)
	// 			.sort((a, b) => {
	// 				let totalMsA = 0;
	// 				Object.keys(this.performanceUsage[a]).forEach((event) => {
	// 					totalMsA += this.performanceUsage[a][event].time;
	// 				});
	// 				let totalMsB = 0;
	// 				Object.keys(this.performanceUsage[b]).forEach((event) => {
	// 					totalMsB += this.performanceUsage[b][event].time;
	// 				});

	// 				return totalMsA - totalMsB;
	// 			})
	// 			.forEach((moduleName) => {
	// 				let totalMs = 0;
	// 				let totalCalls = 0;
	// 				Object.keys(this.performanceUsage[moduleName]).forEach((event) => {
	// 					totalMs += this.performanceUsage[moduleName][event].time;
	// 					totalCalls += this.performanceUsage[moduleName][event].count;
	// 				});

	// 				totalMsGlobal += totalMs;

	// 				ChatLib.chat('&eModule: &7' + moduleName);
	// 				ChatLib.chat('&eTotal: &7' + totalMs.toFixed(2) + 'ms (' + totalCalls + ' calls)');
	// 				Object.keys(this.performanceUsage[moduleName])
	// 					.sort((a, b) => {
	// 						return this.performanceUsage[moduleName][a].time - this.performanceUsage[moduleName][b].time;
	// 					})
	// 					.forEach((event) => {
	// 						ChatLib.chat('  &eEvent:&7 ' + event + ' - ' + this.performanceUsage[moduleName][event].time.toFixed(2) + 'ms (' + this.performanceUsage[moduleName][event].count + ' calls) [' + (this.performanceUsage[moduleName][event].time / this.performanceUsage[moduleName][event].count).toFixed(2) + 'ms avg]');
	// 					});
	// 			});

	// 		ChatLib.chat('&eTotal: &7' + totalMsGlobal.toFixed(2) + 'ms');
	// 	}
	// 	return { performanceUsage: this.performanceUsage, flameGraphData: this.flameGraphData };
	// }
	// addPerformanceTracking(feature) {
	// 	let featureId = feature.id;
	// 	if (!this.perfTrackingFeatures) return;

	// 	Object.getOwnPropertyNames(Object.getPrototypeOf(feature)).forEach((key) => {
	// 		if (typeof feature[key] === 'function') {
	// 			let fun = feature[key].bind(feature);
	// 			feature[key] = (...args) => {
	// 				if (!this.recordingPerformanceUsage || Thread.currentThread().id !== 1 || !this.perfTrackingFeatures) {
	// 					let err = undefined;
	// 					try {
	// 						args ? fun(...args) : fun();
	// 					} catch (e) {
	// 						err = e;
	// 					}
	// 					if (err) throw err;
	// 					return;
	// 				}

	// 				let pushedId = false;
	// 				let start = this.getExactTime();

	// 				if (this.stack.length === 0) {
	// 					this.stack.push([featureId, 0]);
	// 					// this.flameGraphData.push({ isEnter: true, thing: featureId, time: start })
	// 					pushedId = true;
	// 				}
	// 				this.stack.push([featureId + '.' + key, 0]);

	// 				// this.flameGraphData.push({ isEnter: true, thing: featureId + "." + key, time: start })
	// 				let err = undefined;
	// 				try {
	// 					args ? fun(...args) : fun();
	// 				} catch (e) {
	// 					err = e;
	// 				}
	// 				let nowTime = this.getExactTime();
	// 				let time = nowTime - start - this.stack[this.stack.length - 1][1];

	// 				this.stack[this.stack.length - 2][1] += nowTime - start;

	// 				if (!this.performanceUsage[featureId]) this.performanceUsage[featureId] = {};
	// 				if (!this.performanceUsage[featureId].functions) this.performanceUsage[featureId].functions = {};
	// 				if (!this.performanceUsage[featureId].functions[key]) this.performanceUsage[featureId].functions[key] = { time: 0, count: 0 };
	// 				this.performanceUsage[featureId].functions[key].count++;
	// 				this.performanceUsage[featureId].functions[key].time += nowTime - start;

	// 				Logger.debug('Flame graph data: ' + this.stack.map((a) => a[0]).join(';') + ' ' + time);
	// 				this.flameGraphData.push(this.stack.map((a) => a[0]).join(';') + ' ' + time);
	// 				this.stack.pop()[1];
	// 				if (pushedId) {
	// 					let time = nowTime - start - this.stack[this.stack.length - 1][1];
	// 					Logger.debug('Flame graph data: ' + this.stack.map((a) => a[0]).join(';') + ' ' + time);
	// 					this.flameGraphData.push(this.stack.map((a) => a[0]).join(';') + ' ' + time);
	// 					this.stack.pop();
	// 				}

	// 				if (err) throw err;
	// 			};
	// 		}
	// 	});
	// }
	// startRecordingPerformance(feature, event) {
	// 	if (!this.recordingPerformanceUsage) return;

	// 	if (!this.performanceUsage[feature]) this.performanceUsage[feature] = {};
	// 	if (!this.performanceUsage[feature][event]) this.performanceUsage[feature][event] = { time: 0, count: 0 };

	// 	let time = this.getExactTime();

	// 	this.performanceUsage[feature][event].startTime = time;
	// }
	// stopRecordingPerformance(feature, event) {
	// 	if (!this.recordingPerformanceUsage) return;

	// 	let time = this.getExactTime();

	// 	this.performanceUsage[feature][event].time += time - this.performanceUsage[feature][event].startTime;
	// 	this.performanceUsage[feature][event].count++;
	// }
	// getExactTime() {
	// 	return System.nanoTime() / 1000000;
	// }
	//#endregion
}
const main = register('worldLoad', () => {
	main.unregister();
	global.ioi.class = new IOI();
	new Sound({ source: 'ui.loom.select_pattern', category: Sound.Category.MASTER, pitch: 1.5, volume: 0.4 }).play();
	new Sound({ source: 'ui.toast.in', category: Sound.Category.MASTER, pitch: 1.5, volume: 2 }).play();
});
register('gameUnload', () => {
	global.ioi.onGameUnload.forEach((func) => func());
	global.ioi.onGameUnload.clear();
	global.ioi = {};
});
