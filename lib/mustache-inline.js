import { parseMustacheTag } from "./mustache-block";

function findInlineCloseTag(src, openTag, start, max) {
  let tag,
    nesting = 0;

  for (let pos = start; pos < max - 5; ) {
    tag = parseMustacheTag(src, pos, max);
    if (!tag) {
      return false;
    }
    if (tag.closing && tag.name === openTag.name) {
      if (nesting === 0) {
        break;
      }
      nesting--;
    } else if (tag.opening && tag.name === openTag.name) {
      nesting++;
    }
    pos = tag.pos.end + 1;
  }

  return tag;
}

function tokenizeMustacheInline(state, silent) {
  let token;

  const tag = parseMustacheTag(state.src, state.pos, state.posMax);

  if (!tag) {
    return false;
  }

  if (tag.nesting === 0) {
    // self closing
    if (!silent) {
      token = state.push("mustache_inline", "span", 0);
      token.meta = { tag };
    }
    state.pos = tag.pos.end + 1;
    return true;
  }

  if (tag.closing) {
    // close without open
    if (!silent) {
      token = state.push("mustache_inline", "span", 0);
      token.meta = { tag };
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
      token = state.push("mustache_inline", "span", 0);
      token.meta = { tag };
    }
    state.pos = tag.pos.end + 1;
    return true;
  }

  if (!silent) {
    // inline block
    state.push("mustache_open", "span", 1);

    state.pos = tag.pos.end + 1;
    state.posMax = closeTag.pos.start;
    state.md.inline.tokenize(state);
    state.posMax = state.src.length;

    state.push("mustache_close", "span", -1);
  }

  state.pos = closeTag.pos.end + 1;
  return true;
}

function renderMustacheInline(tokens, idx, options, env, renderer) {
  let token = tokens[idx];
  return `<span>${token.meta.tag.raw}</span>`;
}

export function mustacheInline(md) {
  md.inline.ruler.push("mustache-inline", tokenizeMustacheInline);
  md.renderer.rules.mustache_inline = renderMustacheInline;
}
