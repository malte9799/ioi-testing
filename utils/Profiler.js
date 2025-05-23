export default function Profiler(context, func) {
	return (...args) => {
		const result = func.call(context, ...args);
		console.log(result);
		return result;
	};
}
