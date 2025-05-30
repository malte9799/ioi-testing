/// <reference types="../../CTAutocomplete" />
/// <reference lib="es2015" />
import Feature from '../utils/Feature';
import { ToggleSetting } from '../Settings';
import Logger from '../Logger';

class AFK extends Feature {
	constructor() {
		super();

		this.isAfk = false;
		this.lastPos;
		this.lastRotation;
	}
	initSettings() {
		this.ID_afk = new ToggleSetting(this, {
			name: 'AFK',
			description: 'AFK',
			category: 'Misc',
			group: 'AFK',
			value: true,
		});
	}
	onEnable() {
		this.registerChat('You are now AFK.', () => (this.isAfk = true));
		this.registerChat('You are no longer AFK.', () => (this.isAfk = false));
		this.registerStep(false, 60, () => {
			const pos = Player.getPos();
			const rotation = Player.getRotation();

			if (!this.isAfk && this.lastPos?.equals(pos) && this.lastRotation?.equals(rotation)) ChatLib.command('afk');

			this.lastPos = pos;
			this.lastRotation = rotation;
		}).when(World?.toMC()?.getRegistryKey()?.getValue()?.toString() !== 'minecraft:overworld');
	}
	onDisable() {}
}

module.exports = {
	class: new AFK(),
};
