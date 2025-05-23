const LogType = Java.type('com.chattriggers.ctjs.engine.LogType');
class LoggerClass {
	constructor() {
		this.devs = ['a305d4d6bec04983ab0a356a45ae849d'];
		this.loglevel = this.isDev() ? 4 : 3; //0=none, 1=error, 2=warn, 3=info, 4=debug
		this.logPrefixes = ['[E]', '[W]', '[I]', '[D]'];

		this.debugChannels = new Set();
		this.activeDebugChannels = new Set();

		register('command', (channel) => {
			if (this.activeDebugChannels.has(channel.toLowerCase())) {
				this.activeDebugChannels.delete(channel.toLowerCase());
			} else {
				this.activeDebugChannels.add(channel.toLowerCase());
			}
		})
			.setName('debug')
			.setTabCompletions(() => Array.from(this.debugChannels));
	}
	isDev(UUID = Player.getUUID()) {
		return this.devs.includes(UUID.toString().replace(/-/g, ''));
	}

	log(msg) {
		Console.println(msg, LogType.INFO);
	}
	chat(msg) {
		ChatLib.chat(msg);
	}
	error(msg) {
		if (this.loglevel < 1) return;
		Console.println(msg, LogType.ERROR);
	}
	warn(msg) {
		if (this.loglevel < 2) return;
		Console.println(msg, LogType.WARN);
	}
	info(msg) {
		if (this.loglevel < 3) return;
		Console.println(msg, LogType.INFO);
	}
	debug(msg) {
		if (msg.includes(': ')) {
			const [channel, ...msg2] = msg.split(': ');
			this.debugChannels.add(channel);
			if (this.loglevel >= 4 || this.activeDebugChannels.has(channel.toLowerCase())) {
				Console.println(`[D:${channel}] ${msg2.join(': ')}`, LogType.INFO);
				return;
			}
		}
		if (this.loglevel < 4) return;
		Console.println('[D] ' + msg, LogType.INFO);
	}
}

if (!global.ioi.Logger) {
	global.ioi.Logger = new LoggerClass();
}
export default global.ioi.Logger;
