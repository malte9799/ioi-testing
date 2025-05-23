// --- Java Type Imports ---
const TickBoxControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.TickBoxControllerBuilder');
const BooleanControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.BooleanControllerBuilder');
const IntegerSliderControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.IntegerSliderControllerBuilder');
const LongSliderControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.LongSliderControllerBuilder');
const FloatSliderControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.FloatSliderControllerBuilder');
const DoubleSliderControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.DoubleSliderControllerBuilder');
const StringControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.StringControllerBuilder');
const IntegerFieldControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.IntegerFieldControllerBuilder');
const LongFieldControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.LongFieldControllerBuilder');
const FloatFieldControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.FloatFieldControllerBuilder');
const DoubleFieldControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.DoubleFieldControllerBuilder');
const ColorControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.ColorControllerBuilder');
const CyclingListControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.CyclingListControllerBuilder');
const EnumControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.EnumControllerBuilder');
const EnumDropdownControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.EnumDropdownControllerBuilder');
const ItemControllerBuilder = Java.type('dev.isxander.yacl3.api.controller.ItemControllerBuilder');

const JavaDouble = Java.type('java.lang.Double');
const JavaFloat = Java.type('java.lang.Float');
const JavaInt = Java.type('java.lang.Integer');
const JavaLong = Java.type('java.lang.Long');

// You might also need the base interfaces/classes if you're creating custom formatters in JS
// const ValueFormatter = Java.type('dev.isxander.yacl3.api.ValueFormatter');
// const Option = Java.type('dev.isxander.yacl3.api.Option'); // If you need to construct options directly in JS
// const ControllerBuilder = Java.type('dev.isxander.yacl3.api.ControllerBuilder'); // For type hinting if you use JSDoc

//#region  --- Controller Builder Factories ---
/**
 * Creates a factory function for a TickBoxControllerBuilder.
 * @returns {function(Object): dev.isxander.yacl3.api.controller.TickBoxControllerBuilder}
 */
export function tickBox() {
	return (option) => TickBoxControllerBuilder.create(option);
}

/**
 * Creates a factory function for a BooleanControllerBuilder, with an optional value formatter.
 * @param {function | null} [formatter=null] - An optional formatter object or function.
 * @returns {function(Object): dev.isxander.yacl3.api.controller.BooleanControllerBuilder}
 */
export function textSwitch(formatter = null) {
	return (option) => {
		const builder = BooleanControllerBuilder.create(option);
		if (formatter) {
			builder.formatValue(formatter);
		}
		return builder;
	};
}

/**
 * Creates a factory function for an IntegerSliderControllerBuilder.
 * Expects Java `int` values for min and max.
 * @param {number} min - The minimum value (Java int).
 * @param {number} max - The maximum value (Java int).
 * @param {number} [step=1] - The step value (Java int).
 * @param {function | null} [formatter=null] - An optional formatter.
 * @returns {function(Object): dev.isxander.yacl3.api.controller.IntegerSliderControllerBuilder}
 */
export function sliderInt(min, max, step = 1, formatter = null) {
	return (option) => {
		const builder = IntegerSliderControllerBuilder.create(option);
		builder.range(JavaInt(min), JavaInt(max));
		builder.step(JavaInt(step));
		if (formatter) {
			builder.formatValue(formatter);
		}
		return builder;
	};
}

/**
 * Creates a factory function for a LongSliderControllerBuilder.
 * Expects Java `long` values for min and max.
 * @param {number} min - The minimum value (Java long).
 * @param {number} max - The maximum value (Java long).
 * @param {number} [step=1] - The step value (Java long).
 * @param {function | null} [formatter=null] - An optional formatter.
 * @returns {function(Object): dev.isxander.yacl3.api.controller.LongSliderControllerBuilder}
 */
export function sliderLong(min, max, step = 1, formatter = null) {
	return (option) => {
		const builder = LongSliderControllerBuilder.create(option);
		builder.range(JavaLong(min), JavaLong(max));
		builder.step(JavaLong(step));
		if (formatter) {
			builder.formatValue(formatter);
		}
		return builder;
	};
}

/**
 * Creates a factory function for a FloatSliderControllerBuilder.
 * Expects Java `float` values for min and max.
 * @param {number} min - The minimum value (Java float).
 * @param {number} max - The maximum value (Java float).
 * @param {number} [step=1.0] - The step value (Java float).
 * @param {function | null} [formatter=null] - An optional formatter.
 * @returns {function(Object): dev.isxander.yacl3.api.controller.FloatSliderControllerBuilder}
 */
export function sliderFloat(min, max, step = 1.0, formatter = null) {
	return (option) => {
		const builder = FloatSliderControllerBuilder.create(option);
		builder.range(JavaFloat(min), JavaFloat(max));
		builder.step(JavaFloat(step));
		if (formatter) {
			builder.formatValue(formatter);
		}
		return builder;
	};
}

/**
 * Creates a factory function for a DoubleSliderControllerBuilder.
 * Expects Java `double` values for min and max.
 * @param {number} min - The minimum value (Java double).
 * @param {number} max - The maximum value (Java double).
 * @param {number} [step=1.0] - The step value (Java double).
 * @param {function | null} [formatter=null] - An optional formatter.
 * @returns {function(Object): dev.isxander.yacl3.api.controller.DoubleSliderControllerBuilder}
 */
export function sliderDouble(min, max, step = 1.0, formatter = null) {
	return (option) => {
		const builder = DoubleSliderControllerBuilder.create(option);
		builder.range(JavaDouble(min), JavaDouble(max));
		builder.step(JavaDouble(step));
		if (formatter) {
			builder.formatValue(formatter);
		}
		return builder;
	};
}

/**
 * Creates a factory function for a StringControllerBuilder.
 * @returns {function(Object): dev.isxander.yacl3.api.controller.StringControllerBuilder}
 */
export function stringField() {
	return (option) => StringControllerBuilder.create(option);
}

/**
 * Creates a factory function for an IntegerFieldControllerBuilder.
 * Expects Java `int` values for min and max.
 * @param {number | null} [min=null] - Optional minimum value (Java int).
 * @param {number | null} [max=null] - Optional maximum value (Java int).
 * @param {function | null} [formatter=null] - An optional formatter.
 * @returns {function(Object): dev.isxander.yacl3.api.controller.IntegerFieldControllerBuilder}
 */
export function numberFieldInt(min = null, max = null, formatter = null) {
	return (option) => {
		const builder = IntegerFieldControllerBuilder.create(option);
		if (min !== null) builder.min(JavaInt(min));
		if (max !== null) builder.max(JavaInt(max));

		if (formatter) {
			builder.formatValue(formatter);
		}
		return builder;
	};
}

/**
 * Creates a factory function for a LongFieldControllerBuilder.
 * Expects Java `long` values for min and max.
 * @param {number | null} [min=null] - Optional minimum value (Java long).
 * @param {number | null} [max=null] - Optional maximum value (Java long).
 * @param {function | null} [formatter=null] - An optional formatter.
 * @returns {function(Object): dev.isxander.yacl3.api.controller.LongFieldControllerBuilder}
 */
export function numberFieldLong(min = null, max = null, formatter = null) {
	return (option) => {
		const builder = LongFieldControllerBuilder.create(option);
		if (min !== null) builder.min(JavaLong(max));
		if (max !== null) builder.max(JavaLong(max));

		if (formatter) {
			builder.formatValue(formatter);
		}
		return builder;
	};
}

/**
 * Creates a factory function for a FloatFieldControllerBuilder.
 * Expects Java `float` values for min and max.
 * @param {number | null} [min=null] - Optional minimum value (Java float).
 * @param {number | null} [max=null] - Optional maximum value (Java float).
 * @param {function | null} [formatter=null] - An optional formatter.
 * @returns {function(Object): dev.isxander.yacl3.api.controller.FloatFieldControllerBuilder}
 */
export function numberFieldFloat(min = null, max = null, formatter = null) {
	return (option) => {
		const builder = FloatFieldControllerBuilder.create(option);
		if (min !== null) builder.min(JavaFloat(min));
		if (max !== null) builder.max(JavaFloat(max));

		if (formatter) {
			builder.formatValue(formatter);
		}
		return builder;
	};
}

/**
 * Creates a factory function for a DoubleFieldControllerBuilder.
 * Expects Java `double` values for min and max.
 * @param {number | null} [min=null] - Optional minimum value (Java double).
 * @param {number | null} [max=null] - Optional maximum value (Java double).
 * @param {function | null} [formatter=null] - An optional formatter.
 * @returns {function(Object): dev.isxander.yacl3.api.controller.DoubleFieldControllerBuilder}
 */
export function numberFieldDouble(min = null, max = null, formatter = null) {
	return (option) => {
		const builder = DoubleFieldControllerBuilder.create(option);
		if (min !== null) builder.min(JavaDouble(min));
		if (max !== null) builder.max(JavaDouble(max));

		if (formatter) {
			builder.formatValue(formatter);
		}
		return builder;
	};
}

/**
 * Creates a factory function for a ColorControllerBuilder, with an option to allow alpha.
 * @param {boolean} [allowAlpha=false] - Whether to allow alpha channel in the color.
 * @returns {function(Object): dev.isxander.yacl3.api.controller.ColorControllerBuilder}
 */
export function colorPicker(allowAlpha = false) {
	return (option) => {
		const builder = ColorControllerBuilder.create(option);
		builder.allowAlpha(allowAlpha);
		return builder;
	};
}

// /**
//  * Creates a factory function for a CyclingListControllerBuilder.
//  * @param {Iterable<any>} values - The iterable of values for the cycling list.
//  * @param {function | null} [formatter=null] - An optional formatter.
//  * @returns {function(Object): dev.isxander.yacl3.api.controller.CyclingListControllerBuilder}
//  */
// export function cyclingList(values, formatter = null) {
// 	return (option) => {
// 		const builder = CyclingListControllerBuilder.create(option);
// 		builder.values(values);
// 		if (formatter) {
// 			builder.formatValue(formatter);
// 		}
// 		return builder;
// 	};
// }

// /**
//  * Creates a factory function for an EnumControllerBuilder.
//  * @param {Java.type} enumClass - The Java Class object for the enum.
//  * @param {function | null} [formatter=null] - An optional formatter.
//  * @returns {function(Object): dev.isxander.yacl3.api.controller.EnumControllerBuilder}
//  */
// export function enumSwitch(enumClass, formatter = null) {
// 	return (option) => {
// 		const builder = EnumControllerBuilder.create(option);
// 		builder.enumClass(enumClass);
// 		if (formatter) {
// 			builder.formatValue(formatter);
// 		}
// 		return builder;
// 	};
// }

// /**
//  * Creates a factory function for an EnumDropdownControllerBuilder.
//  * @param {function | null} [formatter=null] - An optional formatter.
//  * @returns {function(Object): dev.isxander.yacl3.api.controller.EnumDropdownControllerBuilder}
//  */
// export function enumDropdown(formatter = null) {
// 	return (option) => {
// 		const builder = EnumDropdownControllerBuilder.create(option);
// 		if (formatter) {
// 			builder.formatValue(formatter);
// 		}
// 		return builder;
// 	};
// }

/**
 * Creates a factory function for an ItemControllerBuilder (for Minecraft items).
 * @returns {function(Object): dev.isxander.yacl3.api.controller.ItemControllerBuilder}
 */
export function minecraftItem() {
	return (option) => ItemControllerBuilder.create(option);
}
//#endregion
