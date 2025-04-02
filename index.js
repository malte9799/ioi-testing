/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import { fetch } from './polyfill/Fetch';
import { version, git_repository } from './metadata.json';

function update() {
	const gitUrl = 'https://api.github.com/repos/malte9799/ioi-testing/releases/latest';

	fetch(gitUrl)
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
		});
}

update();
