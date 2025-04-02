/**
 * @typedef {string[] | { [K: string]: SubCommandOption } | (() => string[]) | (() => { [K: string]: SubCommandOption })} SubCommandOption
 */
/**
 * @param {SubCommandOption} opts
 */
export default function (opts) {
	/**
	 * Navigates the data structure based on path arguments.
	 * @param {string[]} args - Path segments.
	 * @returns {string[]} - Matching keys or formatted values, prefixed with the path.
	 */
	return (args) => {
		let c = opts; // c: current level
		const p = []; // p: path segments taken
		const lastIdx = args.length - 1;

		const resolveValue = (val) => {
			return typeof val === 'function' ? val() : val;
		};

		for (let i = 0; i <= lastIdx; i++) {
			const arg = args[i];
			const argLc = arg.toLowerCase();
			const isLast = i === lastIdx;

			c = resolveValue(c); // Resolve the current level if it's a function

			const isObj = typeof c === 'object' && c !== null && !Array.isArray(c);
			const isArr = Array.isArray(c);

			// If we can't traverse further (and it's not the last step), return empty
			// Allow reaching the end even if c is primitive/null, handled in isLast block
			if (!isObj && !isArr && !isLast) return [];

			// --- Handle the LAST argument ---
			if (isLast) {
				const prefix = p.join(' ').trim(); // Get the path prefix string
				const format = (val) => `${prefix} ${val}`.trim(); // Helper to format output

				// Case: Final argument is ''
				if (arg === '') {
					if (isArr) {
						// Current level is Array -> list formatted values
						return c.map(format);
					}
					if (isObj) {
						// Current level is Object -> list formatted keys
						return Object.keys(c).map(format); // <<< FIX: Explicitly handle '' for Objects
					}
					// Current level is not Array or Object (e.g. null, primitive), return empty
					return [];
				}

				// Case: Final argument is NOT '' -> Filter keys/values
				if (isObj || isArr) {
					const source = isObj ? Object.keys(c) : c; // Keys for obj, values for array
					return source
						.filter((v) => String(v).toLowerCase().startsWith(argLc)) // Filter by prefix
						.map(format); // Format results
				}

				// Current level was primitive/null and last arg wasn't ''
				return [];
			}

			// --- Handle NAVIGATION (not the last argument) ---
			// Can only navigate deeper from objects
			if (!isObj) return [];

			const keys = Object.keys(c);
			// Find navigation key: Prefer exact match, fallback to single prefix match
			let navKey = keys.find((k) => k.toLowerCase() === argLc);
			if (!navKey) {
				const potentialKeys = keys.filter((k) => k.toLowerCase().startsWith(argLc));
				if (potentialKeys.length === 1) {
					navKey = potentialKeys[0]; // Allow unambiguous prefix match for navigation
				}
			}

			// If no valid navigation key found, or key doesn't exist, fail
			if (!navKey || typeof c[navKey] === 'undefined') return [];

			// Navigate deeper
			p.push(navKey); // Add key to the path
			c = c[navKey]; // Update current level
		}
		c = resolveValue(c); // Resolve the final level if it's a function
		return typeof c === 'object' && c !== null && !Array.isArray(c) ? Object.keys(c) : Array.isArray(c) ? c : [];
	};
}
