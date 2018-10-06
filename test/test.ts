import { assertEquals } from "https://cdn.rawgit.com/qoh/assert/v0.0.1/src/index.ts";
import { collectAsync } from "https://cdn.rawgit.com/qoh/utility/v0.0.1/src/iterable.ts";
import { compile } from "../src/compile";

export async function basic() {
	const f = compile(`
<ul>
[' for (const name of d.names) { ']
		<li>[[await d.transform(name)]]</li>
[' } ']
</ul>
`);

	const data = { names: ["foo & co", "bar"], transform };

	assertEquals(await call(f, data), `
<ul>

		<li>FOO &amp; CO</li>

		<li>BAR</li>

</ul>
`);
}

export async function blocks() {
	const f = compile(`
[' const blocks = {}; ']
[' blocks.body = async function*() { ']
<ul>
[' for (const name of d.names) { ']
		<li>[[name]]</li>
[' } ']
</ul>
[' }; ']
[* d.include({...d, blocks}) *]
`);

	const data = { names: ["foo & co", "bar"], include };

	assertEquals(await call(f, data), `



<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
	</head>
	<body>
<ul>

		<li>foo &amp; co</li>

		<li>bar</li>

</ul>
</body>
</html>

`);
}

async function transform(s) { return s.toUpperCase(); }

async function call(template, data) {
	return (await collectAsync(template(data))).join("");
}

var include = compile(`
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
	</head>
	<body>[* d.blocks.body() *]</body>
</html>
`);
