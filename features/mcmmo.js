/// <reference types="../../CTAutocomplete" />
/// <reference lib="es2015" />
import Logger from '../Logger';
import Feature from '../utils/Feature';
import Settings, { ToggleSetting, TextSetting } from '../Settings';

const Mode = {
	COOLDOWN: 'COOLDOWN',
	ACTIVE: 'ACTIVE',
	INACTIVE: 'INACTIVE',
};

class Mcmmo extends Feature {
	static setCooldown(tool, sec = 0) {
		sec = parseInt(sec);
		const icm = Player.toMC()?.getItemCooldownManager();
		if (!icm) return;
		icm.set(new ItemType('netherite_' + tool).asItem().toMC(), sec * 20);
		icm.set(new ItemType('diamond_' + tool).asItem().toMC(), sec * 20);
		icm.set(new ItemType('golden_' + tool).asItem().toMC(), sec * 20);
		icm.set(new ItemType('iron_' + tool).asItem().toMC(), sec * 20);
		icm.set(new ItemType('stone_' + tool).asItem().toMC(), sec * 20);
		icm.set(new ItemType('wooden_' + tool).asItem().toMC(), sec * 20);
	}
	static hasCooldown(tool) {
		const icm = Player.toMC()?.getItemCooldownManager();
		if (!icm) return false;
		return icm.isCoolingDown(new ItemType('netherite_' + tool).asItem().toMC());
	}
	static TOOLS = {
		pickaxe: 'super breaker',
		hoe: 'green terra',
		shovel: 'giga drill breaker',
	};
	static SKILLS = {
		mining: 'super breaker',
		herbalism: 'green terra',
		excavation: 'giga drill breaker',
	};

	constructor() {
		super();
		this.abilitys = {
			'super breaker': new Ability({ name: 'Super Breaker', tool: 'pickaxe', activeCooldown: 0, mode: Mode.INACTIVE, skill: 'Mining' }),
			'green terra': new Ability({ name: 'Green Terra', tool: 'hoe', activeCooldown: 0, mode: Mode.INACTIVE, skill: 'Herbalism' }),
			'giga drill breaker': new Ability({ name: 'Giga Drill Breaker', tool: 'shovel', activeCooldown: 0, mode: Mode.INACTIVE, skill: 'Excavation' }),
		};

		this.progressHistory = new Map();
		this.lastProgress = new Map();
	}
	initSettings() {
		this.toggle_eta = new ToggleSetting(this, { name: 'Next Level Estimate', description: 'Shows the time until the next level', category: 'Mcmmo', value: true });
	}
	onEnable() {
		this.registerChat(' | MCMMO | ${skill} increased to ${level}.', (skill, level) => {
			skill = skill.toLowerCase();
			level = parseInt(level.replace(/,/g, ''));
			Mcmmo.SKILLS[skill] = level;
		});
		this.registerStep(false, 1, () => {
			for (const ability in this.abilitys) {
				this.abilitys[ability].reduceCooldown(1);
			}
			if (!Settings.getValue(this.toggle_eta)) return;
			let newProgress = new Map();
			BossBars.getBossBars().forEach((bar) => {
				if (!bar.getName().includes(' Lv.')) return;
				const [skill, level] = ChatLib.removeFormatting(bar.getName())
					.match(/([\w ]+) Lv.([\d,]+)/)
					.slice(1);
				newProgress.set(skill, bar.getPercent());
				if (!this.lastProgress.has(skill)) return;
				const diff = newProgress.get(skill) - this.lastProgress.get(skill);
				if (diff <= 0) return;
				if (!this.progressHistory.has(skill)) this.progressHistory.set(skill, []);
				const history = this.progressHistory.get(skill);
				history.push(diff);
				if (history.length > 10) history.shift();

				const average = history.reduce((a, b) => a + b, 0) / history.length;
				const missing = 1 - bar.getPercent();
				bar.setName(`${skill} Lv.&6${level}&r ETA:${Math.floor(missing / average)}s`);
			});
			this.lastProgress = newProgress;
		});

		// this.registerChat('You ready your ${tool}', (tool) => {});
		this.registerChat('**${ability} ACTIVATED**', (ability) => {
			ability = ability.toLowerCase();
			this.abilitys[ability].activated();
		});
		this.registerChat('**${ability} has worn off**', (ability) => {
			new Sound({ source: 'minecraft:block.conduit.deactivate' }).play();
			ability = ability.toLowerCase();
			this.abilitys[ability].deactivated();
		});
		this.registerChat('Your ${ability} ability is refreshed!', (ability) => {
			ability = ability.toLowerCase();
			this.abilitys[ability].refreshed();
		});
		this.registerChat('You are too tired to use that ability again. (${sec}s)', (sec) => {
			const tool = Player.getHeldItem()?.getType()?.getRegistryName().split('_')[1];
			if (!Mcmmo.TOOLS.hasOwnProperty(tool)) return;
			const ability = Mcmmo.TOOLS[tool];
			this.abilitys[ability].setCooldown(sec);
		});
		this.registerChat('| RC | Your super breaker cooldown has been reduced by ${sec} seconds.', (sec) => {
			this.abilitys['super breaker'].reduceCooldown(sec);
		});
	}
	onDisable() {}
}

class Ability {
	static COOLDOWN = 240;
	static MAX_LENGTH = 22;

	constructor({ name, tool, activeCooldown = 0, mode = Mode.INACTIVE, skill }) {
		this.name = name;
		this.tool = tool;
		this.skillName = skill.toLowerCase();
		this.skillLevel = undefined;
		this.activeCooldown = activeCooldown;
		this.mode = mode;
	}
	activated() {
		this.mode = Mode.ACTIVE;
		this.activeCooldown = this.getAblilityLength();
		Mcmmo.setCooldown(this.tool, this.activeCooldown);
	}
	deactivated() {
		this.mode = Mode.COOLDOWN;
		this.activeCooldown = Ability.COOLDOWN;
		Mcmmo.setCooldown(this.tool, this.activeCooldown);
	}
	refreshed() {
		this.mode = Mode.INACTIVE;
		this.activeCooldown = 0;
		Mcmmo.setCooldown(this.tool, this.activeCooldown);
	}
	getSkillLevel() {
		if (this.skillLevel) return this.skillLevel;
		const levelBar = BossBars.getBossBars().find((bar) => bar.getName().toLowerCase().includes(`${this.skillName} lv.`));
		if (!levelBar) return undefined;
		const level = parseInt(
			ChatLib.removeFormatting(levelBar.getName())
				.match(/Lv.([\d,]+)/)[1]
				?.replace(/,/g, '')
		);
		this.skillLevel = level;
		return level;
	}
	getAblilityLength() {
		const skillLevel = this.getSkillLevel();
		if (!skillLevel) return Ability.MAX_LENGTH;
		return Math.min(Math.floor(skillLevel / 50 + 2), Ability.MAX_LENGTH);
	}
	reduceCooldown(sec) {
		this.activeCooldown -= sec;
		if (this.activeCooldown < 0) this.activeCooldown = 0;
		if (!Mcmmo.hasCooldown(this.tool)) Mcmmo.setCooldown(this.tool, this.activeCooldown);
	}
	setCooldown(sec, force = false) {
		this.activeCooldown = sec;
		if (force || !Mcmmo.hasCooldown(this.tool)) Mcmmo.setCooldown(this.tool, this.activeCooldown);
	}
}

module.exports = {
	class: new Mcmmo(),
};
