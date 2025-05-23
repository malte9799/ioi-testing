const path = require('path');
const fs = require('fs');
const src = __dirname;
const ignore = ['.vscode', 'ioi-testing.zip', '.gitignore', '.git', '.github', 'helper'];

const startingPath = '../../';
const files = [];
const dirs = {};
let f = (_) => {
	fs.readdirSync(_, { withFileTypes: true }).forEach((v) => {
		console.dir(v);
		if (ignore.includes(v.name)) return;
		if (v.name.startsWith('!')) return;
		let p = path.join(_, v.name);
		if (v.isDirectory()) {
			const key = p.slice(startingPath.length);
			if (!dirs[key]) dirs[key] = 0;
			f(p);
		} else {
			files.push(p.slice(startingPath.length));
			const key = path.dirname(p.slice(startingPath.length));
			if (!dirs[key]) dirs[key] = 0;
			dirs[key]++;
		}
	});
};
f(startingPath);

fs.writeFileSync('./!files.txt', files.join('\n'));
fs.writeFileSync(
	'./!dirs.txt',
	Object.entries(dirs)
		.map(([k, v]) => `${k}: ${v}`)
		.join('\n')
);

module.exports = {
	files,
	dirs,
};
