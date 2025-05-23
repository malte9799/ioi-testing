/// <reference types="../../CTAutocomplete" />
/// <reference lib="es2015" />

import { Event } from '../utils/Register';
import RenderLib, { Render2D, Align } from '../utils/RenderLib';
import { ToggleOption, TickBoxOption } from '../settings/Options';

function auctionGuiOpen(gui = Client.currentGui.get()) {
	return gui && /Auction House \(\d\/\d\)/.test(gui.getTitle().getString());
}

// Price per Unit
new Event('guiOpened', onGuiOpened);
// Cooldown
// new Event('guiMouseClick', onGuiMouseClick);
// Sorting Mode
new Event('guiRender', onGuiRender).when(
	auctionGuiOpen,
	new ToggleOption({
		value: true,
		name: 'Price per Unit',
		description: 'Displays price per unit after the total price for stacked items.',
		category: 'Auction',
		group: 'Grouping Test',
	})
);
new ToggleOption({
	value: true,
	name: 'Another Toggle',
	description: '',
	category: 'Auction',
});
new TickBoxOption({
	value: true,
	name: 'A Tickbox',
	description: '',
	category: 'Auction',
});
function onGuiRender(mx, my, gui) {
	if (!auctionGuiOpen(gui)) return;
	const sortModeItem = Player.getContainer().getStackInSlot(49);
	if (!sortModeItem) return 2;
	let sortMode = sortModeItem.getLore().find((it) => {
		it.unformattedText.match(/▍ ꜱᴏʀᴛ ᴛʏᴘᴇ: (.*)/);
	});
	if (!sortMode) return 3;
	sortMode = sortMode[1].unformattedText.slice(13);
	// const modes = ['ᴀsᴄᴇɴᴅɪɴɢ ᴘʀɪᴄᴇ', 'ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ ɴᴀᴍᴇ', 'ʀᴇᴠᴇʀsᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ ɴᴀᴍᴇ', 'sᴇʟʟᴇʀ ɴᴀᴍᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ', 'sᴇʟʟᴇʀ ɴᴀᴍᴇ ʀᴇᴠᴇʀsᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ', '', '', ''];
	const { x, y } = RenderLib.getSlotPos(49, Align.BOTTOM);
	Render2D.drawString({ text: sortMode, x: x, y: y, align: Align.TOP });
}
function onGuiMouseClick(mx, my, mb, action, gui, event) {
	if (!/Auction House \(\d\/\d\)/.test(gui.getTitle().getString())) return;
	const slot = Client.currentGui.getSlotUnderMouse();
	if (!slot || !slot.item) return;
	const item = slot.item;
	if (item.getType().getRegistryName() === 'minecraft:nether_star') {
		const icm = Player.toMC().itemCooldownManager;
		const NetherStar = new ItemType('minecraft:nether_star').asItem().toMC();
		if (icm.isCoolingDown(NetherStar)) return cancel(event);
		icm.set(NetherStar, 10);
	}
	if (item.getType().getRegistryName() === 'minecraft:arrow') {
		const icm = Player.toMC().itemCooldownManager;
		const Arrow = new ItemType('minecraft:arrow').asItem().toMC();
		if (icm.isCoolingDown(Arrow)) return cancel(event);
		icm.set(Arrow, 10);
	}
}

function onGuiOpened(gui, event) {
	if (!/Auction House \(\d\/\d\)/.test(gui.getTitle().getString())) return;
	Client.scheduleTask(() => {
		const items = Player.getContainer().getItems().slice(0, -36);
		items.forEach((item, i) => {
			if (!item) return;
			const stackSize = item.getStackSize();
			if (stackSize == 1) return;
			let lore = item.getLore().map((line) => {
				if (!line.unformattedText.includes('ᴘʀɪᴄᴇ')) return line;
				const price = line.unformattedText.match(/ᴘʀɪᴄᴇ: \$([0-9,]+)/)[1].replaceAll(',', '') / stackSize;
				const priceString = Math.round(price)
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				return new TextComponent(line, ` §7[${stackSize}x§a$${priceString}§7]`);
			});
			item.setLore(lore);
		});
	});
}
