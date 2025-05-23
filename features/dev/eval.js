/// <reference types="../../../CTAutocomplete" />
/// <reference lib="es2015" />

import Logger from '../../utils/Logger';
import Events, { Event, CommandEvent, ChatEvent, ActionBarEvent, PacketReceivedEvent, PacketSentEvent, SoundPlayEvent, StepEvent, RenderBlockEntityEvent, RenderEntityEvent } from '../../utils/Register';
import { ToggleOption, TickBoxOption, NumberOption, ColorOption, TextOption, SliderOption } from '../../settings/Options';
import Settings from '../../settings/Settings';
import RenderLib, { Render2D, Render3D, Align } from '../../utils/RenderLib';
import TabCompletion from '../../utils/TabCompletion';

const metadata = JSON.parse(FileLib.read('ioi-testing', 'metadata.json'));

const log = console.log;
const dir = console.dir;

new CommandEvent('eval', (...args) => {
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
