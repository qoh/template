import { CompiledTemplate } from "./types";

// TODO: Parse the code result so we can replace `foo` with `data.foo`.

const AsyncGeneratorFunction =
	Object.getPrototypeOf(async function* () { }).constructor;

export interface Options {
	dataVariable?: string;
	escapeInput?(input: string): string;
}

export function compile(
	template: string,
	options: Options = {},
): CompiledTemplate {
	const dataVar = options.dataVariable === undefined
		? "d"
		: options.dataVariable;
	const escapeInput = options.escapeInput === undefined
		? escapeInputHTML
		: options.escapeInput;

	const escapeInputVar = "__escapeInput";
	const codeParts = ["\"use strict\";"];

	let position = 0;

	while (position < template.length) {
		const startIndex = template.indexOf("[", position);

		if (startIndex !== -1 && startIndex !== template.length - 1) {
			const startChar = template.charAt(startIndex + 1);
			const endChar = startChar === "[" ? "]" : startChar;

			// TODO: Don't stop on closers inside strings, like `[[ "]]" ]]`
			const endIndex = template.indexOf(endChar + "]", startIndex);

			if (endIndex !== -1) {
				// Push the untemplated data before this section
				const before = template.substring(position, startIndex);
				codeParts.push(`yield ${stringToJS(before)};`);

				const inside = template.substring(startIndex + 2, endIndex);
				position = endIndex + 2;

				if (startChar === "'") {
					codeParts.push(inside);
					continue;
				} else if (startChar === "[") {
					codeParts.push(`yield ${escapeInputVar}(${inside});`);
					continue;
				} else if (startChar === "!") {
					codeParts.push(`yield ${inside};`);
					continue;
				} else if (startChar === "*") {
					codeParts.push(`yield* ${inside};`);
				}
			}
		}

		// If we get here, there are no more valid sections
		// Push the remaining untemplated data before stopping
		const remaining = template.substr(position);
		codeParts.push(`yield ${stringToJS(remaining)};`);
		break;
	}

	const code = codeParts.join("\n");

	let f;

	try {
		f = AsyncGeneratorFunction(escapeInputVar, dataVar, code);
	} catch (error) {
		console.error("Failed to compile template. Generated code:");
		console.error(code);
		throw error;
	}

	return data => f(escapeInput, data);
}

const htmlReplacements = {
	"\"": "&quot;",
	"'": "&#39;",
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
};

function escapeInputHTML(input: string): string {
	return input.replace(/["'&<>]/g, s => htmlReplacements[s]);
}

function stringToJS(input: string): string {
	return JSON.stringify(input);
}
