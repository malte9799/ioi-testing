/// <reference types="../../CTAutocomplete" />
/// <reference lib="es2015" />
import Feature from '../utils/Feature';
import Settings, { ToggleSetting } from '../Settings';
import Logger from '../Logger';
import RenderLib, { Align, Render2D } from '../utils/RenderLib';

class Auction extends Feature {
	constructor() {
		super();
	}
	initSettings() {
		this.toggle_pricePerUnit = new ToggleSetting(this, {
			name: 'Auction Price Per Unit',
			description: 'Displays price per unit after the total price for stacked items.',
			category: 'Miscellaneous',
			group: 'Auction',
			value: true,
		});
		this.toggle_showSortMode = new ToggleSetting(this, {
			name: 'Show Sort Mode',
			description: 'Shows the sort mode of the auction house.',
			category: 'Miscellaneous',
			group: 'Auction',
			value: true,
		});
	}
	onEnable() {
		this.register('guiOpened', (gui) => {
			if (!gui.getTitle().getString().includes('Auction House')) return;
			if (Settings.getValue(this.toggle_showSortMode)) this.trigger_postGuiRender.register();
			if (!Settings.getValue(this.toggle_pricePerUnit)) return;
			Client.scheduleTask(() => {
				try {
					Player.getContainer()
						.getItems()
						.slice(0, -36)
						.forEach((item, i) => {
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
				} catch (e) {
					Logger.error(JSON.stringify(e, undefined, 2));
					Logger.warn(e.stack);
				}
			});
		});

		this.trigger_postGuiRender = this.register('postGuiRender', (mx, my, gui) => {
			if (!gui.getTitle().getString().includes('Auction House')) return this.trigger_postGuiRender.unregister();
			const infoItem = Player.getContainer().getItems()[49];
			if (!infoItem) return;
			const sortType = infoItem.getLore().find((line) => line.unformattedText.includes('ꜱᴏʀᴛ ᴛʏᴘᴇ:'));

			const { x, y } = RenderLib.getSlotPos(49, Align.BOTTOM);
			let text = sortType.unformattedText.split(': ')[1];
			text = sortTypes[text];

			Render2D.drawString({
				text,
				x,
				y: y + 2,
				align: Align.TOP,
				shadow: true,
			});
			// [§rAuction House, §r§8Information, §r, §r§f▍ §rᴄᴏᴍᴍᴀɴᴅ: §r§7/ᴀʜ ꜱᴇʟʟ <ᴘʀɪᴄᴇ> [<ɴᴜᴍʙᴇʀ ᴏꜰ ɪᴛᴇᴍꜱ>], §r, §r§f▍ §rɪᴛᴇᴍꜱ ᴀᴠᴀɪʟᴀʙʟᴇ§r§7: §r§7147, §r§f▍ §rꜱᴏʀᴛ ᴛʏᴘᴇ§r§7: §r§7ɪᴛᴇᴍ sᴛᴀᴄᴋ sɪᴢᴇ ᴅᴇsᴄᴇɴᴅɪɴɢ, §r, §r§l§7⊳§r§7 Click to change the
			// [§rAuction House, §r§8Information, §r, §r§f▍ §rᴄᴏᴍᴍᴀɴᴅ: §r§7/ᴀʜ ꜱᴇʟʟ <ᴘʀɪᴄᴇ> [<ɴᴜᴍʙᴇʀ ᴏꜰ ɪᴛᴇᴍꜱ>], §r, §r§f▍ §rɪᴛᴇᴍꜱ ᴀᴠᴀɪʟᴀʙʟᴇ§r§7: §r§7147, §r§f▍ §rꜱᴏʀᴛ ᴛʏᴘᴇ§r§7: §r§7ᴅᴇᴄʀᴇᴀsɪɴɢ ᴅᴀᴛᴇ, §r, §r§l§7⊳§r§7 Click to change the sort type]
		}).unregister();
	}
	onDisable() {}
}
const sortTypes = {
	//
	'ᴅᴇᴄʀᴇᴀsɪɴɢ ᴅᴀᴛᴇ': 'ᴅᴀᴛᴇ: ←',
	'ᴅᴇᴄʀᴇᴀsɪɴɢ ᴘʀɪᴄᴇ': 'ᴘʀɪᴄᴇ: ←',
	'ᴀsᴄᴇɴᴅɪɴɢ ᴅᴀᴛᴇ': 'ᴅᴀᴛᴇ: →',
	'ᴀsᴄᴇɴᴅɪɴɢ ᴘʀɪᴄᴇ': 'ᴘʀɪᴄᴇ: →',
	'ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ ɴᴀᴍᴇ': 'ɴᴀᴍᴇ: A-Z',
	'ʀᴇᴠᴇʀsᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ ɴᴀᴍᴇ': 'ɴᴀᴍᴇ: Z-A',
	'sᴇʟʟᴇʀ ɴᴀᴍᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ': 'sᴇʟʟᴇʀ ɴᴀᴍᴇ: A-Z',
	'sᴇʟʟᴇʀ ɴᴀᴍᴇ ʀᴇᴠᴇʀsᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ': 'sᴇʟʟᴇʀ ɴᴀᴍᴇ: Z-A',
	'ᴍᴀᴛᴇʀɪᴀʟ ᴛʏᴘᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ': 'ᴍᴀᴛᴇʀɪᴀʟ ᴛʏᴘᴇ: A-Z',
	'ᴍᴀᴛᴇʀɪᴀʟ ᴛʏᴘᴇ ʀᴇᴠᴇʀsᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ': 'ᴍᴀᴛᴇʀɪᴀʟ ᴛʏᴘᴇ: Z-A',
	'ᴇᴄᴏɴᴏᴍʏ ɴᴀᴍᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ': 'WHERE?????',
	'ᴇᴄᴏɴᴏᴍʏ ɴᴀᴍᴇ ʀᴇᴠᴇʀsᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ': 'ᴇᴄᴏɴᴏᴍʏ ɴᴀᴍᴇ: Z-A',
	'ɪᴛᴇᴍ sᴛᴀᴄᴋ sɪᴢᴇ ᴀsᴄᴇɴᴅɪɴɢ': 'ɪᴛᴇᴍ sᴛᴀᴄᴋ sɪᴢᴇ: →',
	'ɪᴛᴇᴍ sᴛᴀᴄᴋ sɪᴢᴇ ᴅᴇsᴄᴇɴᴅɪɴɢ': 'ɪᴛᴇᴍ sᴛᴀᴄᴋ sɪᴢᴇ: ←',
};
const sortDir = new Map([
	['ʀᴇᴠᴇʀsᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ', 'Z→A'],
	['ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ', 'A→Z'],
	['ᴀsᴄᴇɴᴅɪɴɢ', '0→∞'],
	['ᴅᴇsᴄᴇɴᴅɪɴɢ', '∞→0'],
	['ᴅᴇᴄʀᴇᴀsɪɴɢ', '∞→0'],
]);
// const sortType = new Map([
// 	'ʀᴇᴠᴇʀsᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ': 'Z-A',
// 	'ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ': 'A-Z',
// 	'ᴀsᴄᴇɴᴅɪɴɢ': '->',
// 	'ᴅᴇsᴄᴇɴᴅɪɴɢ': '<-',
// };

module.exports = {
	class: new Auction(),
};

// [ioi] Replacing ʀᴇᴠᴇʀsᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ with Z-A in text: ▍ ꜱᴏʀᴛ ᴛʏᴘᴇ
// [ioi] Replacing ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ with A-Z in text: ▍ ꜱᴏʀᴛ ᴛʏᴘᴇ
// [ioi] Replacing ᴀsᴄᴇɴᴅɪɴɢ with -> in text: ▍ ꜱᴏʀᴛ ᴛʏᴘᴇ
// [ioi] Replacing ᴅᴇsᴄᴇɴᴅɪɴɢ with <- in text: ▍ ꜱᴏʀᴛ ᴛʏᴘᴇ
// [ioi] [Watcher] Change detected in 'auction'
// [ioi] Replacing ʀᴇᴠᴇʀsᴇ ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ with Z-A in text: ▍ ꜱᴏʀᴛ ᴛʏᴘᴇ
// [ioi] Replacing ᴀʟᴘʜᴀʙᴇᴛɪᴄᴀʟ with A-Z in text: ▍ ꜱᴏʀᴛ ᴛʏᴘᴇ
// [ioi] Replacing ᴀsᴄᴇɴᴅɪɴɢ with -> in text: ▍ ꜱᴏʀᴛ ᴛʏᴘᴇ
// [ioi] Replacing ᴅᴇsᴄᴇɴᴅɪɴɢ with <- in text: ▍ ꜱᴏʀᴛ ᴛʏᴘᴇ
