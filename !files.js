const path = require('path');
const fs = require('fs');
const src = __dirname;
const ignore = ['.vscode', 'ioi.zip', '.gitignore', '.git', '.github', 'docs', 'data', 'dev', 'helper'];

const files = [];
const dirs = [];
let f = (_) => {
	fs.readdirSync(_, { withFileTypes: true }).forEach((v) => {
		if (ignore.includes(v.name)) return;
		if (v.name.startsWith('!')) return;
		let p = path.join(_, v.name);
		if (v.isDirectory()) {
			dirs.push(p);
			f(p);
		} else files.push(p);
	});
};
f('.');

fs.writeFileSync('./!files.txt', files.join('\n'));
fs.writeFileSync('./!dirs.txt', dirs.join('\n'));

module.exports = {
	files,
	dirs,
};
