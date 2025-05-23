/// <reference types="../../CTAutocomplete" />
/// <reference lib="es2015" />

import { Event, ChatEvent } from '../utils/Register';
import RenderLib, { Render2D, Align } from '../utils/RenderLib';
import { ToggleOption, TickBoxOption } from '../settings/Options';

const mainToggle = true;
// const mainToggle = new ToggleOption({
// 	value: true,
// 	name: 'Toggle Option',
// 	description: 'Toggle Option Description',
// 	category: 'Miscellaneous',
// 	group: 'Chat',
// });

let msg = undefined;
let gangChat = false;

new ChatEvent('You are now in private conversation with ${player}.', (player) => {
	msg = player;
}).when(mainToggle);
new ChatEvent('You are no longer in private conversation with ${player}.', (player) => {
	msg = undefined;
}).when(mainToggle);
new ChatEvent('Gang Chat has been enabled', () => {
	gangChat = true;
}).when(mainToggle);
new ChatEvent('Gang Chat has been disabled', () => {
	gangChat = false;
}).when(mainToggle);

new Event('guiOpened', (gui) => {
	if (gui.getTitle().getString() !== 'Chat screen' || (!gangChat && !msg)) return;
	Client.scheduleTask(1, () => {
		if (Client.getCurrentChatMessage()) return;
		Client.setCurrentChatMessage(gangChat ? '/gc ' : `/msg ${msg} `);
	});
});
