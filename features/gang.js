/// <reference types="../../CTAutocomplete" />
/// <reference lib="es2015" />
import Feature from '../utils/Feature';
import { ToggleSetting } from '../Settings';
import Logger from '../Logger';

class Gang extends Feature {
	static status = ['&a⬤', '&6⬤', '&c🚫'];
	constructor() {
		super();
	}
	initSettings() {}
	onEnable() {
		this.register('guiOpened', (gui) => {
			if (!gui.getTitle().getString().includes(' Information')) return;
			Client.scheduleTask(() => {
				try {
					const infoItem = Player.getContainer().getItems()[11];
					if (!infoItem || infoItem.getName() !== '§rGeneral Gang Information') return;
					if (!infoItem.getLore().join(' ').includes(Player.getName())) return;

					let lore = infoItem.getLore().map((line) => {
						const text = line.unformattedText;
						if (!text.includes('☺')) return line;
						const player = text.split(': ').pop();

						const tabName =
							TabList.getNames()
								.find((name) => name?.toString()?.includes(player))
								?.toString() || '';
						const isOnline = !!tabName;
						const isAfk = tabName.includes('[AFK]');

						let status = isOnline ? (isAfk ? Gang.status[1] : Gang.status[0]) : Gang.status[2];
						// &a⬤ | &6⬤ | &c⛔
						// ☺ | ⏸ | 🚫
						// ☑ | ☐ | ☒
						return new TextComponent(status, { text: line.getString().slice(1), color: line.getStyle().getColor() }, line.withoutTextAt(0));
					});
					lore.push(new TextComponent(`${Gang.status[0]} &7ᴏɴʟɪɴᴇ &8| ${Gang.status[1]} &7ᴀꜰᴋ &8| ${Gang.status[2]} &7ᴏꜰꜰʟɪɴᴇ`));
					infoItem.setLore(lore);
				} catch (e) {
					Logger.error(`Error while updating gang info`);
					Logger.error(JSON.stringify(e, undefined, 2));
					Logger.warn(e.stack);
				}
			});
		});
	}
	onDisable() {}
}

module.exports = {
	class: new Gang(),
};
