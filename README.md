# Usage

```typescript
import { compile } from "template/mod.ts";

const template = "...";
const options = {};
const render = compile(template, options);

const data = {};
const result = render(data);
```

---

### `compile<TData=any>(template: string, options?: Options): CompiledTemplate<TData>`

Compile a source template string to a function
that will emit a rendered template given data.

#### `Options.async: boolean`

*Default:* `true`

Compile the template code in an async function.
Allows use of `await`.

#### `Options.dataVariable: string`

*Default:* `d`

Name of variable at which data passed to render function is available.

#### `Options.escapeInput(input: string): string`

*Default:* HTML escaping

Function used for transforming data included with `[[ ... ]]`.

# Syntax

## Expanding to expressions

Include the result of an expression and escape it with `[[ expression ]]`.

```
1 + 2 is [[ 1 + 2 ]].
```

Prevent escaping and include the result verbatim with `[! expression !]`.

```html
<article>[! d.renderMarkdown(d.articleBody) !]</article>
```

## Using code for control flow

To loop over collections, branch based on conditions,
or perform more specialized logic,
write partial JavaScript fragments within `[' code ']`.

```html
<nav>
[' if (d.user) { ']
    <a href="/logout">Log out</a>
[' } else { ']
    <a href="/login">Log in</a>
[' } ']
</nav>
```

This can be very versatile, such as being used for extending layouts:

```html
[' const blocks = {}; ']
[' blocks.body = function*() { ']
<ul>
[' for (const name of d.names) { ']
	<li>[[name]]</li>
[' } ']
</ul>
[' }; ']
[* d.baseLayout({...d, blocks}) *]
```

Where the `baseLayout` template is:

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
	</head>
	<body>[* d.blocks.body() *]</body>
</html>
```

## Including strings from an iterable

In the special case that you would otherwise
loop over an iterable of strings,
and expand all its items verbatim,
you can instead of use `[* iterable *]`.