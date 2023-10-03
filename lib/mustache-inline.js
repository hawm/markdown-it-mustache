import { mustacheOpener, parseMustacheTag } from "./mustache-block";

function findInlineCloseTag(src, openTag, start, max) {
  let tag,
    nesting = 0;

  for (let pos = start; pos < max - 5; pos = tag.pos.end + 1) {
    tag = parseMustacheTag(src, pos, max);

    if (!tag) {
      return false;
    }

    if (tag.closing && tag.name === openTag.name) {
      if (nesting === 0) {
        return tag;
      }
      nesting--;
    } else if (tag.opening && tag.name === openTag.name) {
      nesting++;
    }
  }

  return false;
}

function tokenizeMustacheInline(state, silent) {
  let token;

  if (state.src.charCodeAt(state.pos) !== mustacheOpener) {
    return false;
  }

  const tag = parseMustacheTag(state.src, state.pos, state.posMax);

  if (!tag) {
    return false;
  }

  if (tag.nesting === 0) {
    // self closing
    if (!silent) {
      token = state.push("mustache_inline", "span", 0);
      token.meta = { tag };
      token.attrs = [
        ["class", "mustache mustache-inline"],
        ["data-mustache-name", tag.name],
        ["data-mustache-mark", tag.mark],
      ];
    }
    state.pos = tag.pos.end + 1;
    return true;
  }

  if (tag.closing) {
    // close without open
    if (!silent) {
      token = state.push("mustache_invalid", "span", 0);
      token.meta = { tag };
      token.attrs = [
        ["class", "mustache mustache-inline mustache-invalid"],
        ["data-mustache-name", tag.name],
        ["data-mustache-mark", tag.mark],
        ["data-mustache-msg", "missing open tag"],
      ];
    }
    state.pos = tag.pos.end + 1;
    return true;
  }

  const closeTag = findInlineCloseTag(
    state.src,
    tag,
    tag.pos.end + 1,
    state.posMax
  );

  if (!closeTag) {
    // open without close
    if (!silent) {
      token = state.push("mustache_invalid", "span", 0);
      token.meta = { tag };
      token.content = closeTag.raw;
      token.attrs = [
        ["class", "mustache mustache-inline mustache-invalid"],
        ["data-mustache-name", tag.name],
        ["data-mustache-mark", tag.mark],
        ["data-mustache-msg", "missing close tag"],
      ];
    }
    state.pos = tag.pos.end + 1;
    return true;
  }

  if (!silent) {
    // wrap inline block
    token = state.push("mustache_inline_block", "span", 1);
    token.meta = { tag };
    token.attrs = [
      ["class", "mustache mustache-inline mustache-inline-block"],
      ["data-mustache-name", tag.name],
      ["data-mustache-mark", tag.mark],
    ];

    state.pos = tag.pos.end + 1;
    state.posMax = closeTag.pos.start;
    state.md.inline.tokenize(state);
    state.pos = closeTag.pos.end + 1;
    state.posMax = state.src.length;

    token = state.push("mustache_inline_block", "span", -1);
    token.meta = { tag: closeTag };
  }

  state.pos = closeTag.pos.end + 1;
  return true;
}

export function mustacheInline(md) {
  md.inline.ruler.push("mustache_inline", tokenizeMustacheInline);
}
