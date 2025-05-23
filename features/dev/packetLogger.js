/// <reference types="../../../CTAutocomplete" />
/// <reference lib="es2015" />

import { Event, CommandEvent, PacketReceivedEvent, PacketSentEvent } from '../../utils/Register';
import RenderLib, { Render2D, Align } from '../../utils/RenderLib';
import { ToggleOption, TickBoxOption } from '../../settings/Options';

const ignore = new Set([
	//
	'ClientTickEndC2SPacket',
	'CommonPongC2SPacket',
	'PlayerMoveC2SPacket$PositionAndOnGround',
	'PlayerMoveC2SPacket$Full',
	'PlayerMoveC2SPacket$LookAndOnGround',
	'KeepAliveC2SPacket',
]);
// const send = [];
// const sendCount = new Map();
// const received = [];
// const receivedCount = new Map();

const screenWidth = Renderer.screen.getWidth();
const sentDisplay = new Display()
	.setX(0)
	.setY(0)
	.setMinWidth(screenWidth / 2);
const receivedDisplay = new Display()
	.setX(screenWidth / 2)
	.setY(0)
	.setMinWidth(screenWidth / 2);

global.sents = [];
global.receiveds = [];
let sent = false;
let received = false;
let display = false;
new PacketReceivedEvent(null, (packet) => {
	if (!received) return;
	const className = Mappings.unmapClass(packet.getClass());
	if (ignore.has(className) || ignore.has(className.split('/').pop())) return;
	// receivedCount.set(className, (receivedCount.get(className) || 0) + 1);
	// received.push({ name: className, packet });
	// if (received.length > 100) received.shift();
	// ChatLib.chat('<- ' + className);
	const text = '-> ' + className;
	receivedDisplay.addLine(text);
	if (receivedDisplay.getLines().length > 40) receivedDisplay.removeLine(0);
	global.receiveds.push({ name: className, packet });
	if (global.receiveds.length > 20) global.receiveds.shift();
	// new TextComponent({
	// 	text,
	// 	clickEvent: { action: 'run_command', value: '/packets ignore ' + className + ' received' },
	// 	hoverEvent: { action: 'show_text', value: '§cClick to ignore' },
	// }).chat();
}).when(() => received);

new PacketSentEvent(null, (packet) => {
	if (!sent) return;
	const className = Mappings.unmapClass(packet.getClass());
	if (ignore.has(className) || ignore.has(className.split('/').pop())) return;
	// sendCount.set(className, (sendCount.get(className) || 0) + 1);
	// send.push({ name: className, packet });
	// if (send.length > 100) send.shift();
	// ChatLib.chat('-> ' + className);
	const text = '-> ' + className;
	sentDisplay.addLine(text);
	if (sentDisplay.getLines().length > 40) sentDisplay.removeLine(0);
	global.sents.push({ name: className, packet });
	if (global.sents.length > 20) global.sents.shift();
	// new TextComponent({
	// 	text,
	// 	clickEvent: { action: 'run_command', value: '/packets ignore ' + className + ' sent' },
	// 	hoverEvent: { action: 'show_text', value: '§cClick to ignore' },
	// }).chat();
}).when(() => sent);

new Event('renderOverlay', () => {
	if (!display) return;
	sentDisplay.draw();
	receivedDisplay.draw();
}).when(() => display);

new CommandEvent(
	'packets',
	(...args) => {
		switch (args[0]) {
			case 'ignore':
				ignore.add(args[1]);
				break;
			case 'toggleSent':
				sent = !sent;
				break;
			case 'toggleReceived':
				received = !received;
				break;
			case 'toggleDisplay':
				display = !display;
				break;
		}
	},
	['ignore', 'toggleSent', 'toggleReceived', 'toggleDisplay']
);

// new Event('renderOverlay', () => {
// 	sendDisplay.draw();
// 	receivedDisplay.draw();
// });
