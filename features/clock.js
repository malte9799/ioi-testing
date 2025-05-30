/// <reference types="../../CTAutocomplete" />
/// <reference lib="es2015" />
import Feature from '../utils/Feature';

class Clock extends Feature {
	constructor() {
		super();
	}
	onEnable() {
		this.registerStep(false, 30, () => {
			const timeLine = Scoreboard.getLines().find((line) => line.toString().includes('⌚'));
			if (!timeLine) return;
			timeLine.setName(new TextComponent(` &7${new Date().toLocaleTimeString().slice(0, 5)}`));
		});
	}
}

module.exports = {
	class: new Clock(),
};
