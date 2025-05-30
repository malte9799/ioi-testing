/// <reference types="../../CTAutocomplete" />
/// <reference lib="es2015" />

import Feature from '../utils/Feature';

const MAX_DAMAGE = Java.type('net.minecraft.component.DataComponentTypes').MAX_DAMAGE;
const ComponentMap = Java.type('net.minecraft.component.ComponentMap');
const Integer = Java.type('java.lang.Integer');

class CrateCooldown extends Feature {
	constructor() {
		super();

		this.cooldowns = new Map();
		this.baseCooldown = 30;
	}
	onEnable() {
		this.registerStep(false, 1, () => {
			if (this.cooldowns.size == 0) return;
			Player.getInventory()
				.getItems()
				.forEach((item) => {
					if (!item || item.getType().getRegistryName() !== 'minecraft:player_head') return;
					const name = ChatLib.removeFormatting(item.getName());
					if (!this.cooldowns.has(name)) return;
					const cooldown = this.cooldowns.get(name);
					if (item.getMaxDamage() == 0) {
						item.toMC().applyComponentsFrom(ComponentMap.builder().add(MAX_DAMAGE, new Integer(this.baseCooldown)).build());
					}
					item.toMC().setDamage(cooldown);
				});
			this.cooldowns.forEach((cooldown, item) => {
				if (cooldown <= 0) return this.cooldowns.delete(item);
				cooldown -= 1;
				this.cooldowns.set(item, cooldown);
			});
		});

		this.registerChat('| CRATES | You just received 1 ${crate}.', (crate) => {
			this.cooldowns.set(crate, this.baseCooldown);
		});
		this.registerChat('| CRATES | You just received a ${crate}.', (crate) => {
			this.cooldowns.set(crate, this.baseCooldown);
		});
		this.registerChat('| CRATES | You just received a crate. Claim it with /claim!', () => {
			const item = Player.getHeldItem()?.getType()?.getRegistryName();
			if (!item) return;
			if (item.includes('_pickaxe')) {
				this.cooldowns.set('Mine Crate (Inmate)', this.baseCooldown);
				this.cooldowns.set('Mine Crate (Detainee)', this.baseCooldown);
				this.cooldowns.set('Mine Crate (Convict)', this.baseCooldown);
				this.cooldowns.set('Mine Crate (Felon)', this.baseCooldown);
			} else if (item.includes('_hoe')) {
				this.cooldowns.set('Farming Crate (Inmate)', this.baseCooldown);
				this.cooldowns.set('Farming Crate (Detainee)', this.baseCooldown);
				this.cooldowns.set('Farming Crate (Convict)', this.baseCooldown);
				this.cooldowns.set('Farming Crate (Felon)', this.baseCooldown);
			} else if (item == 'minecraft:fishing_rod') {
				this.cooldowns.set('Fishing Crate (Inmate)', this.baseCooldown);
				this.cooldowns.set('Fishing Crate (Detainee)', this.baseCooldown);
				this.cooldowns.set('Fishing Crate (Convict)', this.baseCooldown);
				this.cooldowns.set('Fishing Crate (Felon)', this.baseCooldown);
			}
		});
	}

	onDisable() {}
}
module.exports = {
	class: new CrateCooldown(),
};
