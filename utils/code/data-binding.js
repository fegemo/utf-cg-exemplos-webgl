// Declarative two-way binding: binds inputs with [data-bind-value] to state objects

import { hexToRGB, RGBToHex } from './color-utils.js';

// Simple two-way binding utility for a plain object property <-> input element
export function bindProperty(obj, prop, inputEl, options = {}) {
	const parse = options.parse ?? ((v) => (v === '' ? NaN : parseFloat(v)));
	const format = options.format ?? ((v) => (v == null ? '' : String(v)));
	
	if (!inputEl) throw new Error('input element required');
	
	// If the property is not configurable or already has an accessor, fallback to polling sync
	const desc = Object.getOwnPropertyDescriptor(obj, prop);
	if (desc && (!desc.configurable || desc.get || desc.set)) {
		// polling fallback: keep input in sync with obj[prop]
		inputEl.value = format(obj[prop]);
		inputEl.addEventListener('input', () => {
			const v = parse(inputEl.value);
			try { obj[prop] = v; } catch (e) { /* ignore write errors */ }
		});
		let rafId = null;
		const tick = () => {
			inputEl.value = format(obj[prop]);
			rafId = requestAnimationFrame(tick);
		};
		rafId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId);
	}
	
	// Replace the property with an accessor that updates the input element when changed
	let internal = obj[prop];
	Object.defineProperty(obj, prop, {
		configurable: true,
		enumerable: true,
		get() { return internal; },
		set(v) {
			internal = v;
			const formatted = format(v);
			if (document.activeElement !== inputEl) {
				inputEl.value = formatted;
			} else {
				// still update value so visual matches, but avoid moving caret unexpectedly
				inputEl.value = formatted;
			}
		}
	});
	
	// initialize input value
	inputEl.value = format(internal);
	
	// when user changes the input, update the object property
	const onInput = () => {
		const v = parse(inputEl.value);
		obj[prop] = v;
	};
	inputEl.addEventListener('input', onInput);
	
	// return an unbind function
	return function unbind() {
		inputEl.removeEventListener('input', onInput);
	};
}

const contexts = new Map(); // name -> object registered by the app
const unbinders = new WeakMap(); // element -> unbind function
let domReady = document.readyState !== 'loading';


// Returns a parser function for an input element.
// Purpose: convert input string values to the desired JS value when writing
// into the bound state property.
// Examples:
// - Default number input: `data-bind-value="state.x"` on `<input type="range">` will use a numeric parser.
// - Color input (auto-detected): `<input type="color" data-bind-value="state.colorBegin">` parses hex -> [r,g,b].
// - Named parser override: `<input data-bind-parse="hexToRGB" ...>` will look up `hexToRGB`.
function pickParser(el) {
    const hint = el.dataset.bindParse;
	// named parser override (data-bind-parse="fnName")
	if (hint) {
		const fn = resolveNamedFunction(hint);
		if (typeof fn === 'function') return (v) => fn(v);
		console.warn(`[data-binding] parser not found: ${hint}`);
	}
	if (hint === 'int' || hint === 'integer') return (v) => parseInt(v ?? '', 10);
	if (hint === 'float' || hint === 'number') return (v) => parseFloat(v ?? '');
	if (el.type === 'number' || el.type === 'range') return (v) => parseFloat(v ?? '');
	// auto-detect color inputs
	if (el.type === 'color') return (v) => hexToRGB(v ?? '#000000');
	return (v) => v;
}


// Returns a formatter function for an input element.
// Purpose: convert a JS value from state into a string suitable for the
// input element when updating the UI.
// Examples:
// - Number inputs will format numbers to strings.
// - Color inputs (auto-detected) will format `[r,g,b]` arrays to `#RRGGBB`.
// - Named formatter override: `data-bind-format="RGBToHex"` will use that function.
function pickFormatter(el) {
    const hint = el.dataset.bindFormat;
	// named formatter override (data-bind-format="fnName")
	if (hint) {
		const fn = resolveNamedFunction(hint);
		if (typeof fn === 'function') return (v) => fn(v);
		console.warn(`[data-binding] formatter not found: ${hint}`);
	}
	if (hint === 'int' || hint === 'integer') return (v) => (v == null ? '' : String(Math.trunc(v)));
	if (hint === 'float' || hint === 'number') return (v) => (v == null ? '' : String(Number(v)));
	// auto-detect color inputs
	if (el.type === 'color') return (v) => (Array.isArray(v) ? RGBToHex(v) : (v == null ? '' : String(v)));
	return (v) => (v == null ? '' : String(v));
}

function resolveNamedFunction(name) {
	if (!name) return null;
	// dotted path: ctx.fn or ctx.sub.fn
	const parts = name.split('.').filter(Boolean);
	if (parts.length > 1) {
		const rootName = parts.shift();
		const root = contexts.get(rootName) ?? window[rootName];
		if (!root) return null;
		let cur = root;
		while (parts.length > 0) {
			cur = cur?.[parts.shift()];
			if (cur == null) return null;
		}
		return typeof cur === 'function' ? cur : null;
	}

	// single name: search registered contexts for a function property, then window, then local helpers
	for (const obj of contexts.values()) {
		if (obj && typeof obj[name] === 'function') return obj[name];
	}
	if (typeof window !== 'undefined' && typeof window[name] === 'function') return window[name];
	// built-in helpers
	if (name === 'hexToRGB') return hexToRGB;
	if (name === 'RGBToHex' || name === 'rgbToHex') return RGBToHex;
	return null;
}

function resolvePath(path) {
	const parts = path.split('.').filter(Boolean);
	if (parts.length === 0) return null;
	const rootName = parts.shift();
	const root = contexts.get(rootName) ?? window[rootName];
	if (!root) return null;
	let target = root;
	while (parts.length > 1) {
		target = target?.[parts.shift()];
		if (target == null) return null;
	}
	const prop = parts.shift();
	if (!prop) return null;
	return { target, prop };
}

// Usage: <span data-bind-text="state.t.toFixed(2)"></span>
// Evaluates the JavaScript expression in the attribute value against registered
// contexts (see `registerBindingContext`) and updates the element's innerText
// reactively.
function bindTextElement(el) {
	const expr = el.getAttribute('data-bind-text');
	if (!expr || unbinders.has(el)) return;
	
	// Build a function that evaluates the expression against registered contexts
	const contextNames = Array.from(contexts.keys());
	const contextValues = contextNames.map(name => contexts.get(name));
	
	let evalFn;
	try {
		// Create a function with context objects as parameters
		evalFn = new Function(...contextNames, `return ${expr};`);
	} catch (e) {
		console.warn(`[data-binding] Invalid expression: ${expr}`, e);
		return;
	}
	
	// Update the element text by evaluating the expression
	const updateText = () => {
		try {
			const result = evalFn(...contextValues);
			el.innerText = result == null ? '' : String(result);
		} catch (e) {
			console.warn(`[data-binding] Error evaluating: ${expr}`, e);
		}
	};
	
	// Initial update
	updateText();
	
	// Poll for changes using requestAnimationFrame
	let rafId = null;
	const tick = () => {
		updateText();
		rafId = requestAnimationFrame(tick);
	};
	rafId = requestAnimationFrame(tick);
	
	// Store unbind function
	unbinders.set(el, () => cancelAnimationFrame(rafId));
}

// Usage: <kbd data-bind-class="pressed:state.keys.ArrowUp active:state.t>0.5"></kbd>
// The `data-bind-class` attribute accepts space-separated token pairs
// `className:expression`. Each expression is evaluated against registered
// contexts and the corresponding class is added/removed based on truthiness.
function bindClassElement(el) {
	// Parse token pairs from a single attribute: "className:expression class2:expr2"
	const attrValue = el.getAttribute('data-bind-class');
	if (!attrValue || unbinders.has(el)) return;

	const tokens = attrValue.trim().split(/\s+/).filter(Boolean);
	if (tokens.length === 0) return;

	const bindings = tokens.map((token) => {
		const idx = token.indexOf(':');
		if (idx === -1) return null;
		const className = token.substring(0, idx).trim();
		const expr = token.substring(idx + 1).trim();
		if (!className || !expr) return null;
		return { className, expr };
	}).filter(Boolean);

	if (bindings.length === 0) return;

	const contextNames = Array.from(contexts.keys());
	const contextValues = contextNames.map(name => contexts.get(name));

	const evalFns = bindings.map(({ className, expr }) => {
		try {
			const fn = new Function(...contextNames, `return ${expr};`);
			return { className, fn };
		} catch (e) {
			console.warn(`[data-binding] Invalid class expression: ${expr}`, e);
			return { className, fn: null };
		}
	});

	const updateClasses = () => {
		for (const { className, fn } of evalFns) {
			if (!fn) continue;
			try {
				const res = fn(...contextValues);
				if (res) el.classList.add(className); else el.classList.remove(className);
			} catch (e) {
				console.warn(`[data-binding] Error evaluating class: ${className}`, e);
			}
		}
	};

	updateClasses();

	let rafId = null;
	const tick = () => {
		updateClasses();
		rafId = requestAnimationFrame(tick);
	};
	rafId = requestAnimationFrame(tick);

	unbinders.set(el, () => cancelAnimationFrame(rafId));
}

// Usage: <input data-bind-value="state.t"> after calling
// `registerBindingContext('state', appState)` from your module.
// Binds an input element's value two-way with the object property.
function bindElement(el) {
	const path = el.getAttribute('data-bind-value');
	if (!path || unbinders.has(el)) return;
	const resolved = resolvePath(path);
	if (!resolved) {
		console.warn(`[data-binding] Could not resolve path: ${path}`);
		return;
	}
	const { target, prop } = resolved;
	const unbind = bindProperty(target, prop, el, {
		parse: pickParser(el),
		format: pickFormatter(el)
	});
	unbinders.set(el, unbind);
}

export function applyDeclarativeBindings() {
	document.querySelectorAll('[data-bind-value]').forEach(bindElement);
	document.querySelectorAll('[data-bind-text]').forEach(bindTextElement);
	document.querySelectorAll('[data-bind-class]').forEach(bindClassElement);
}

export function registerBindingContext(name, obj) {
	if (!name || typeof obj !== 'object') {
		console.warn('[data-binding] registerBindingContext requires a name and object');
		return;
	}
	contexts.set(name, obj);
	if (domReady) applyDeclarativeBindings();
}

document.addEventListener('DOMContentLoaded', () => {
	domReady = true;
	applyDeclarativeBindings();
});
