import { join } from 'path';
import { readdirSync, writeFileSync } from 'fs';
const src = __dirname;
const ignore = ['.vscode', 'ioi-testing.zip', '.gitignore', '.git'];

const files = [];
const dirs = [];
let f = (_) => {
	readdirSync(_, { withFileTypes: true }).forEach((v) => {
		if (ignore.includes(v.name)) return;
		if (v.name.startsWith('!')) return;
		let p = join(_, v.name);
		let s = join(src, p);
		if (v.isDirectory()) {
			dirs.push(p);
			f(p);
		} else files.push(p);
	});
};
f('.');

writeFileSync('./!files.txt', files.join('\n'));
writeFileSync('./!dirs.txt', dirs.join('\n'));

export default {
	files,
	dirs,
};
