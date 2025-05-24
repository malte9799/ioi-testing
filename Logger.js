const LogType = Java.type('com.chattriggers.ctjs.engine.LogType');

class LoggerClass {
	constructor() {
		this.devs = ['a305d4d6bec04983ab0a356a45ae849d'];
		this.loglevel = this.isDev() ? 4 : 3; //0=none, 1=error, 2=warn, 3=info, 4=debug
		this.logPrefixes = ['[E]', '[W]', '[I]', '[D]'];
		this.chatPrefix = '[ioi] &7';

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
	info(...msg) {
		if (this.loglevel < 3) return;
		if (msg.length == 1) Console.println('[INFO] ' + msg[0], LogType.INFO);
		else Console.println(`[INFO:${msg[0]}] ${msg[1]}`, LogType.INFO);
	}
	debug(...msg) {
		if (this.loglevel < 4) return;
		if (msg.length == 1) Console.println('[DEBUG] ' + msg[0], LogType.INFO);
		else Console.println(`[DEBUG:${msg[0]}] ${msg[1]}`, LogType.INFO);
	}
	reportableError(error, desc) {
		const text = new TextComponent().withChatLineId();
		const id = text.getChatLineId();
		text.edit(
			new TextComponent(
				'&8[&6&lioi&8]',
				`&cA fatal error occured! (${desc})`,
				'\n',
				{
					text: '&4[Always Ignore]',
					hoverEvent: { action: 'show_text', value: '&cClick to ignore all future errors' },
					clickEvent: { action: 'run_command', value: '/ioi report ignoreAll' },
				},
				{
					text: '&c[Ignore]',
					hoverEvent: { action: 'show_text', value: '&cClick to ignore this error' },
					clickEvent: { action: 'run_command', value: '/ioi report ignore' },
				},
				{
					text: '&a[Send Report]',
					hoverEvent: { action: 'show_text', value: '&aClick to send a report to the developer' },
					clickEvent: { action: 'run_command', value: '/ioi report send' },
				},
				{
					text: '&2[Always Send]',
					hoverEvent: { action: 'show_text', value: '&aClick to always send error reports' },
					clickEvent: { action: 'run_command', value: '/ioi report sendAll' },
				}.setCh
			)
		);
		// ChatLib.chat('[ioi]&c A fatal error occured! [' + desc + ']');
	}
}

if (!global.ioi.Logger) {
	global.ioi.Logger = new LoggerClass();
}
export default global.ioi.Logger;
