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

  return tag;
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
      token = state.push("mustache_inline", "", 0);
      token.meta = { tag };
    }
    state.pos = tag.pos.end + 1;
    return true;
  }

  if (tag.closing) {
    // close without open
    if (!silent) {
      token = state.push("mustache_inline", "", 0);
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
      token = state.push("mustache_inline", "", 0);
      token.meta = { tag };
    }
    state.pos = tag.pos.end + 1;
    return true;
  }

  if (!silent) {
    // inline block
    token = state.push("mustache_inline_block", "", 0);
    token.children = [];
    state.md.inline.parse(
      state.src.slice(tag.pos.end + 1, closeTag.pos.start),
      state.md,
      {},
      token.children
    );
  }

  state.pos = closeTag.pos.end + 1;
  return true;
}

function renderMustacheInline(tokens, idx, options, env, renderer) {
  const token = tokens[idx];
  return `<span>${token.meta.tag.raw}</span>`;
}

function renderMustacheInlineBlock(tokens, idx, options, env, renderer) {
  const token = tokens[idx];
  const content = renderer.renderInline(token.children, options, env);
  return `<span>${content}</span>`;
}

export function mustacheInline(
  md,
  renderInline = renderMustacheInline,
  renderInlineBlock = renderMustacheInlineBlock
) {
  md.inline.ruler.push("mustache_inline", tokenizeMustacheInline);
  md.renderer.rules.mustache_inline = renderInline;
  md.renderer.rules.mustache_inline_block = renderInlineBlock;
}
