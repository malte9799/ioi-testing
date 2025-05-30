const pathSymbol = Symbol('path');
export default class PersistentObject {
	constructor(name, defaultObject = {}) {
		this[pathSymbol] = [global.ioi.module, `data/playerData/${name}.json`];
		let data = FileLib.read(this[pathSymbol][0], this[pathSymbol][1]);
		try {
			data = data ? JSON.parse(data) : {};
		} catch (e) {
			console.error(e);
			console.log(`[PogData] Reset ${module} to default data`);
			data = {};
		}
		Object.assign(this, defaultObject, data);
		global.ioi.onGameUnload.add(() => this.save());
	}

	save() {
		FileLib.write(this[pathSymbol][0], this[pathSymbol][1], JSON.stringify(this, null, 4), true);
	}

	autosave(interval = 5) {
		register('step', () => this.save()).setDelay(60 * interval);
	}
}
