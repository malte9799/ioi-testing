/// <reference types="../../../CTAutocomplete" />
/// <reference lib="es2015" />
import Feature from '../../utils/Feature';

const PickItemFromBlockC2SPacket = net.minecraft.network.packet.c2s.play.PickItemFromBlockC2SPacket;

class Restock extends Feature {
	constructor() {
		super();
	}
	onEnable() {
		this.register('blockPlace', (block, item) => {
			if (item.getStackSize() != 0 || !Player.getInventory().contains(item.getType().getId())) return;
			Client.scheduleTask(() => {
				Client.sendPacket(new PickItemFromBlockC2SPacket(block.getPos().toMC(), false));
			});
		});
	}

	onDisable() {}
}
module.exports = {
	class: new Restock(),
};
