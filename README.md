# markdown-it-mustache

Mustache template plugin for markdown-it markdown parser.

By default, this plugin will render a parsed mustache token as invisiblity element with some attributes, `span` for inline and `div` for block.

## Examples

### Interpolation

```
{{test}}
```

```html
<span
  class="mustache mustache-inline"
  data-mustache-name="test"
  data-mustache-mark=""
></span>
```

### Inline Section

```
{{#test}}test{{/test}}
```

```html
<span
  class="mustache mustache-inline mustache-inline-block"
  data-mustache-name="test"
  data-mustache-mark="#"
  >test</span
>
```

### Block Section

```
{{#test}}
test
{{/test}}
```

```html
<div
  class="mustache mustache-block"
  data-mustache-name="test"
  data-mustache-mark="#"
>
  <p>test</p>
</div>
```

## Customize

Use a custom render, disaply mustache interpolation tag.

```js
import { mustacheInline } from "markdown-it-mustache";

function renderMustacheInline(tokens, idx, options, env, renderer) {
  const token = tokens[idx];
  const tag = token.tag || "span";
  const mustache = token.meta.tag;
  return `<${tag}>${mustache.raw}</${tag}>`;
}

const md = require("markdown-it")().use(mustacheInline, renderMustacheInline);
```
