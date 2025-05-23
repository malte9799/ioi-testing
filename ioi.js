//#region Mixins
import { ClientPlayerInteractionManager_breakBlock, BlockItem_place_head, BlockItem_place_tail } from './mixins.js';
const onBlockBreakTrigger = createCustomTrigger('ioi:blockBreak');
ClientPlayerInteractionManager_breakBlock.attach((instance, cir, pos) => {
	if (!World.isLoaded()) return;
	const block = World.getBlockAt(new BlockPos(pos));
	onBlockBreakTrigger.trigger(block);
});

const onBlockplaceTrigger = createCustomTrigger('ioi:blockPlace');
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
		global.ioi = {
			onGameUnload: new Set(),
		};

		this.featureFiles = getAllFeatureFiles('./config/ChatTriggers/modules/ioi-testing/features');
		this.featureFiles.forEach((feature) => {
			require('./features/' + feature);
		});
		register('gameUnload', this.gameUnload);
	}
	gameUnload() {
		global.ioi.onGameUnload.forEach((func) => func());
		global.ioi.onGameUnload.clear();
		global.ioi = {};
	}
}

const main = register('worldLoad', () => {
	main.unregister();
	new IOI();
	new Sound({ source: 'ui.loom.select_pattern', category: Sound.Category.MASTER, pitch: 1.5, volume: 0.4 }).play();
	new Sound({ source: 'ui.toast.in', category: Sound.Category.MASTER, pitch: 1.5, volume: 2 }).play();
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
