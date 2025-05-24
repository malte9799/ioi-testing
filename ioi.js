/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

global.ioi = { onGameUnload: new Set(), command: new Map() };
import Logger from './Logger';

const FileSystems = Java.type('java.nio.file.FileSystems');
const Paths = Java.type('java.nio.file.Paths');
const Files = Java.type('java.nio.file.Files');
const File = Java.type('java.io.File');
const StandardWatchEventKinds = Java.type('java.nio.file.StandardWatchEventKinds');

//#region  RequireNoCache
const CTRequireClass = Java.type('com.chattriggers.ctjs.internal.engine.JSLoader$CTRequire');
const UrlModuleSourceProvider = Java.type('org.mozilla.javascript.commonjs.module.provider.UrlModuleSourceProvider');
const UrlModuleSourceProviderInstance = new UrlModuleSourceProvider(null, null);
const StrongCachingModuleScriptProviderClass = Java.type('org.mozilla.javascript.commonjs.module.provider.StrongCachingModuleScriptProvider');
let StrongCachingModuleScriptProvider = new StrongCachingModuleScriptProviderClass(UrlModuleSourceProviderInstance);
let CTRequire = new CTRequireClass(StrongCachingModuleScriptProvider);

function RequireNoCache(place) {
	if (Logger.isDev()) {
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
		this.metadata = JSON.parse(FileLib.read(this.module, 'metadata.json'));
		this.moduleDir = ChatTriggers.MODULES_FOLDER + '/' + this.module;

		this.features = new Map();
		this.featureFiles = new Set();

		// Dynamic Events
		register('step', () => {
			this.features.forEach((feature) => {
				if (!feature.enabled) return;
				feature.events.forEach((event) => {
					if (!event.conditions.size) return;
					let enabled = true;
					event.conditions.forEach((func) => {
						if (enabled && !func()) enabled = false;
					});
					if (enabled) event.register();
					else event.unregister();
				});
			});
		}).setDelay(5);

		register('command', (...args) => {
			if (args[0] == 'feature') {
				if (args[1] == 'list') {
					Logger.info('Feature list:');
					Object.keys(this.featureFiles).forEach((e) => Logger.info(e));
				}
				if (args[1] == 'load') {
					if (this.loadFeature(args[2])) Logger.chat('Feature loaded:' + args[2]);
					else Logger.warn("Couldn' load feature " + args[2]);
				}
				if (args[1] == 'unload') {
					this.unloadFeature(args[2]);
				}
				if (args[1] == 'reload') {
					this.unloadFeature(args[2]);
					this.loadFeature(args[2]);
				}
			}
			if (args[0] == 'load') {
				if (this.enabled) Logger.warn('IOI is already enabled');
				else this.loadMain();
			} else if (args[0] == 'unload') {
				if (!this.enabled) Logger.warn('IOI is not enabled');
				else this.unloadMain();
			} else if (args[0] == 'reload') {
				if (!this.enabled) Logger.warn('IOI is not enabled');
				else this.unloadMain();
				this.loadMain();
			}
		})
			.setName('ioi')
			.setTabCompletions((e) => Logger.debug(e));

		this.loadMain();
		global.ioi.onGameUnload.add(() => {
			this.unloadMain();
		});
	}

	loadMain() {
		this.enabled = true;
		const start = Date.now();
		Logger.debug('Loading IOI module...');
		if (Logger.isDev()) this.loadWatcher();
		this.loadFeatureFiles();
		this.loadAllFeatures();
		Logger.info('IOI loaded');
		Logger.debug('IOI took ' + ((Date.now() - start) / 1000).toFixed(2) + 's to load');
	}
	unloadMain() {
		this.enabled = false;
		Logger.log('Disabling IOI module...');

		this.unloadAllFeatures();

		if (Logger.isDev()) {
			this.watcherStepTrigger?.unregister();
			if (!this.watchService) return;
			try {
				this.watchService.close();
			} catch (e) {
				Logger.error(`Error closing WatchService: ${e}`);
			}
		}
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
			this.features.set(feature, loadedFeature);
			loadedFeature.class.ioi = this;
			loadedFeature.class.id = feature;
			loadedFeature.class._onEnable();
			Logger.info('Feat', '■ Loaded ' + feature);
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
			Logger.info('Feat', '□ Unloaded ' + feature);
			return true;
		} catch (e) {
			Logger.error('Error unloading feature ' + feature);
			Logger.error(JSON.stringify(e, undefined, 2));
			Logger.warn(e.stack);
			return false;
		}
	}
	loadWatcher() {
		if (!Logger.isDev()) return;
		this.watchers = new Set(); // Set: path
		this.watchService = FileSystems.getDefault().newWatchService();
		this.reloadingModules = new Set();
		this.reloadModuleTime = 0;

		new NonPooledThread(() => {
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
					const feature = path.subpath(6, path.getNameCount()).toString().replace(/\\/g, '/');
					Logger.debug('Watcher', `Change detected: ${feature}`);
					// const feature = event.context().toString().slice(0, -3);
					if (!this.features.has(feature) || this.reloadingModules.has(feature)) return;
					this.reloadingModules.add(feature);
					this.reloadModuleTime = Date.now() + 100;
					Logger.info('Watcher', '▣ Reloading ' + feature);
					// Logger.chat('▣ Reloading ' + feature);
				});
				if (!key.reset()) {
					this.watchers.delete(key.watchable().toString());
				}
			}
		}).start();
		this.watcherStepTrigger = register('step', () => {
			if (this.reloadModuleTime === 0 || Date.now() - this.reloadModuleTime <= 0) return;
			this.reloadModuleTime = 0;
			this.reloadingModules.forEach((feature) => {
				this.unloadFeature(feature);
			});
			this.reloadingModules.forEach((feature) => {
				this.loadFeature(feature);
			});
			this.reloadingModules.clear();
		}).setFps(2);
	}
	addWatcher(feature) {
		if (!Logger.isDev() || !this.watchService) return;
		const path = Paths.get(this.moduleDir, 'features', feature + '.js').getParent();
		if (this.watchers.has(path.toString())) return;
		this.watchers.add(path.toString());
		path.register(this.watchService, StandardWatchEventKinds.ENTRY_MODIFY), path;
		Logger.info('Watcher', `Now watching: ${this.module}/features/${feature.split('/').slice(0, -1).join('/')}`);
	}
}
const main = register('worldLoad', () => {
	main.unregister();
	new IOI();
	new Sound({ source: 'ui.loom.select_pattern', category: Sound.Category.MASTER, pitch: 1.5, volume: 0.4 }).play();
	new Sound({ source: 'ui.toast.in', category: Sound.Category.MASTER, pitch: 1.5, volume: 2 }).play();
});
register('gameUnload', () => {
	global.ioi.onGameUnload.forEach((func) => func());
	global.ioi.onGameUnload.clear();
	global.ioi = {};
});
