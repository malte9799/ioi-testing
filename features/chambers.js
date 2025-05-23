/// <reference types="../../CTAutocomplete" />
/// <reference lib="es2015" />

import { Event, ChatEvent } from '../utils/Register';
import RenderLib, { Render2D, Align } from '../utils/RenderLib';
import { ToggleOption, TickBoxOption } from '../settings/Options';

const chamberTitle = new ToggleOption({
	value: true,
	name: 'Chamber Title',
	description: "Shows a Titles when you 'Sence a Chamber nearby...'",
	category: 'Mining',
	group: 'Chambers',
});

new ChatEvent('| CHAMBERS | You sense a great chamber near by...', () => Client.showTitle('', '&7You sense a great chamber nearby...', 5, 40, 10)).when(chamberTitle);
new ChatEvent('| CHAMBERS | You sense a chamber near by...', () => Client.showTitle('', '&7You sense a chamber nearby...', 5, 40, 10)).when(chamberTitle);
