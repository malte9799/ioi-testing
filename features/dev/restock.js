/// <reference types="../../../CTAutocomplete" />
/// <reference lib="es2015" />

import { Event } from '../../utils/Register';

const PickItemFromBlockC2SPacket = net.minecraft.network.packet.c2s.play.PickItemFromBlockC2SPacket;

new Event('ioi:blockPlace', (block, item) => {
	if (item.getStackSize() != 0 || !Player.getInventory().contains(item.getType().getId())) return;
	Client.scheduleTask(() => {
		Client.sendPacket(new PickItemFromBlockC2SPacket(block.getPos().toMC(), false));
	});
});
