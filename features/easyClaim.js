/// <reference types="../../CTAutocomplete" />
/// <reference lib="es2015" />
import Feature from '../utils/Feature';
import RenderLib, { Render2D, Align } from '../utils/RenderLib';

const claimList = ['Keys', 'GPUs', 'Prestige', 'Contraband', 'Pets', 'Drops', 'Farming Crates', 'Mine Crates', 'Fishing Crates', 'Fishing Rewards', 'Champion'];

class EasyClaim extends Feature {
	constructor() {
		super();
	}
	onEnable() {
		this.register('postGuiRender', (mouseX, mouseY, gui, event) => {
			if (!claimList.includes(gui.getTitle().getString())) return;
			Player.getContainer()
				.getItems()
				.slice(0, -36)
				.forEach((item, index) => {
					if (!item || !item.getLore()) return;
					const lore = ChatLib.removeFormatting(item.getLore().join(' '));
					const match = lore.match(/You have ([0-9.]+)/);
					if (!match || match[1] == 0) return;
					if (item.getStackSize() != match[1]) item.setStackSize(match[1]);
					const { x, y } = RenderLib.getSlotPos(index);
					Render2D.drawRect({ x, y, scale: 16, color: Renderer.GOLD });
				});
		});
	}
	onDisable() {}
}

module.exports = {
	class: new EasyClaim(),
};
