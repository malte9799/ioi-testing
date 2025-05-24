/// <reference types="../../../CTAutocomplete" />
/// <reference lib="es2015" />
import Feature from '../../utils/Feature';
import Logger from '../../Logger';
import Settings from '../../Settings';

const log = console.log;
const dir = console.dir;
const chat = ChatLib.chat;

class Eval extends Feature {
	constructor() {
		super();
	}
	onEnable() {
		this.registerCommand('eval', (...args) => {
			let result;
			try {
				result = eval(args.join(' '));
			} catch (e) {
				Logger.error(`Error in Eval:`);
				Logger.warn(JSON.stringify(e, undefined, 2));
				if (e.stack) Logger.warn(e.stack);
				throw e;
			} finally {
				ChatLib.chat(result);
				console.log(result);
			}
		});
	}
}
