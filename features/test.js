/// <reference types="../../CTAutocomplete" />
/// <reference lib="es2015" />

import Feature from '../utils/Feature';

class Test extends Feature {
	constructor() {
		super();
	}

	onEnable() {
		this.registerCommand('ping', () => {
			ChatLib.chat('pong');
		});
	}
}

module.exports = {
	class: new Test(),
};
