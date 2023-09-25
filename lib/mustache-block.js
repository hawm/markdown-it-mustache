const mustacheOpener = 123; /* { */
const mustacheCloser = 125; /* } */
const mustacheBlockOpeners = [35 /* # */, 94 /* ^ */];
const mustacheBlockCloser = 47; /* / */

function trailingSpaceOnly(src, start, max, isWhiteSpace) {
  for (let pos = start; pos < max; pos++) {
    if (!isWhiteSpace(src.charCodeAt(pos))) {
      return false;
    }
  }

  return true;
}

function findMustacheTagPos(src, start, max, multiline = false) {
  let startPos, endPos, open;

  for (startPos = start; startPos < max - 5; startPos++) {
    if (
      src.charCodeAt(startPos) === mustacheOpener &&
      src.charCodeAt(startPos + 1) === mustacheOpener
    ) {
      open = true;
      break;
    }

    // multiline block must tokenize at first char
    // inline block must stop tokenize at line break
    if (multiline || src.charCodeAt(startPos) === 0x0a /* \n */) {
      return false;
    }
  }

  if (!open) {
    return false;
  }

  for (endPos = startPos + 2; endPos <= max; endPos++) {
    if (
      src.charCodeAt(endPos - 1) == mustacheCloser &&
      src.charCodeAt(endPos) == mustacheCloser
    ) {
      return { start: startPos, end: endPos };
    }
  }

  return false;
}

export function parseMustacheTag(src, start, max, multiline = false) {
  const pos = findMustacheTagPos(src, start, max, multiline);
  if (!pos) {
    return false;
  }

  const raw = src.slice(pos.start, pos.end + 1);
  const content = raw.slice(2, -2);
  const opening = mustacheBlockOpeners.includes(content.charCodeAt(0));
  const closing = content.charCodeAt(0) === mustacheBlockCloser;
  const nesting = opening ? 1 : closing ? -1 : 0;
  const name = content.slice(Math.abs(nesting));

  return {
    opening,
    closing,
    nesting,
    name,
    raw,
    pos,
  };
}

function findBlockCloseTag(state, openTag, startLine, endLine) {
  let start,
    max,
    stopLine,
    tag,
    nesting = 0;

  for (stopLine = startLine; stopLine <= endLine; stopLine++) {
    start = state.bMarks[stopLine] + state.tShift[stopLine];
    max = state.eMarks[stopLine];

    if (start < max && state.sCount[stopLine] < state.blkIndent) {
      // stop list when new line without indent
      break;
    }

    if (state.sCount[stopLine] - state.blkIndent >= 4) {
      // closing mustache block less than 4 spaces
      continue;
    }

    tag = parseMustacheTag(state.src, start, max, true);

    if (!tag) {
      continue;
    }

    if (
      !trailingSpaceOnly(
        state.src,
        tag.pos.end + 1,
        state.eMarks[stopLine],
        state.md.utils.isWhiteSpace
      )
    ) {
      continue;
    }

    if (tag.closing && tag.name === openTag.name) {
      if (nesting === 0) {
        tag.line = stopLine;
        tag.block = true;
        break;
      }
      nesting--;
    } else if (tag.opening && tag.name === openTag.name) {
      nesting++;
    }
  }

  return tag;
}

function tokenizeMustacheBlock(state, startLine, endLine, silent) {
  const start = state.bMarks[startLine] + state.tShift[startLine],
    max = state.eMarks[startLine];

  const tag = parseMustacheTag(state.src, start, max, true);

  if (!tag || !tag.opening) {
    return false;
  }

  if (
    !trailingSpaceOnly(
      state.src,
      tag.pos.end + 1,
      max,
      state.md.utils.isWhiteSpace
    )
  ) {
    return false;
  }

  const closeTag = findBlockCloseTag(state, tag, startLine + 1, endLine);

  if (!closeTag) {
    return false;
  }

  if (!silent) {
    const openToken = state.push("mustache_open", "", 1);
    openToken.block = true;
    openToken.meta = { tag };
    openToken.map = [startLine, closeTag.line];

    const old_parent = state.parentType;
    const old_line_max = state.lineMax;
    state.parentType = "mustache_block";
    state.lineMax = closeTag.line;
    state.md.block.tokenize(state, startLine + 1, closeTag.line);
    state.parentType = old_parent;
    state.lineMax = old_line_max;

    const closeToken = state.push("mustache_close", "", -1);
    closeToken.block = true;
  }

  state.line = closeTag.line + 1;

  return true;
}

function renderMustacheBlock(tokens, idx, options, env, renderer) {
  let token = tokens[idx];
  if (token.nesting === -1) {
    return "</details>";
  }
  let tag = token.meta.tag;
  return `<details><summary>${tag.name}</summary>`;
}

export function mustacheBlock(md, renderBlock = renderMustacheBlock) {
  md.block.ruler.after("fence", "mustache_block", tokenizeMustacheBlock, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });
  md.renderer.rules.mustache_open = renderBlock;
  md.renderer.rules.mustache_close = renderBlock;
}
