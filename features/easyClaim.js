/// <reference types="../../CTAutocomplete" />
/// <reference lib="es2015" />

import { Event } from '../utils/Register';
import RenderLib, { Render2D, Align } from '../utils/RenderLib';
import { ToggleOption, TickBoxOption, ColorOption } from '../settings/Options';

const claimList = ['Keys', 'GPUs', 'Prestige', 'Contraband', 'Pets', 'Drops', 'Farming Crates', 'Mine Crates', 'Fishing Crates', 'Fishing Rewards', 'Champion'];
function claimGuiOpen(gui = Client.currentGui.get()) {
	return gui && claimList.includes(gui.getTitle().getString());
}

const showCount = new ToggleOption({
	name: 'Show Count',
	description: 'Shows the count of the items in the claim slots.',
	category: 'Misc',
	group: 'Claim',
	value: true,
});
const showBackground = new ToggleOption({
	name: 'Show Background',
	description: 'Shows the background of the claim slots.',
	category: 'Misc',
	group: 'Claim',
	value: true,
});
const backgroundColor = new ColorOption({
	name: 'Background Color',
	description: 'Set the Background of the slots Background.',
	category: 'Misc',
	group: 'Claim',
});

new Event('guiOpened', setCount).when(showCount);
new Event('postGuiRender', renderBackground).when(showBackground);
//     (mouseX, mouseY, gui, event) => {
// 	if (!claimList.includes(Player.getContainer()?.getName()?.getString())) return;

// 	Player.getContainer()
// 		.getItems()
// 		.slice(0, -36)
// 		.forEach((item, index) => {
// 			if (!item || !item.getLore() || ChatLib.removeFormatting(item.getName()) == ' ') return;
// 			const lore = ChatLib.removeFormatting(item.getLore().join(' '));
// 			if (!lore.includes('You have ')) return;
// 			const count = lore.match(/You have ([0-9.]+)/)[1];
// 			if (count == 0) return;
// 			if (item.getStackSize() != count) item.setStackSize(count);
// 			const { x, y } = RenderLib.getSlotPos(index);
// 			Render2D.drawRect({ x, y, scale: 16, color: Renderer.GOLD });
// 		});
// });
function setCount(mx, my, gui, event) {
	if (!claimGuiOpen(gui)) return;
	Client.scheduleTask(() => {
		Player.getContainer()
			.getItems()
			.slice(0, -36)
			.forEach((item, index) => {
				if (!item || !item.getLore() || ChatLib.removeFormatting(item.getName()) == ' ') return;
				const lore = ChatLib.removeFormatting(item.getLore().join(' '));
				if (!lore.includes('You have ')) return;
				const count = lore.match(/You have ([0-9.]+)/)[1];
				item.setStackSize(count);
			});
	});
}
function renderBackground(mx, my, gui, event) {
	if (!claimGuiOpen(gui)) return;
	Player.getContainer()
		.getItems()
		.slice(0, -36)
		.forEach((item, index) => {
			if (!item || !item.getLore() || ChatLib.removeFormatting(item.getName()) == ' ') return;
			const lore = ChatLib.removeFormatting(item.getLore().join(' '));
			if (!lore.includes('You have ')) return;
			const count = lore.match(/You have ([0-9.]+)/)[1];
			if (count == 0) return;
			const { x, y } = RenderLib.getSlotPos(index);
			Render2D.drawRect({ x, y, scale: 16, color: Renderer.GOLD });
		});
}
