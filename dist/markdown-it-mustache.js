const d = [
  35,
  94
  /* ^ */
], k = 47, g = [
  33,
  38,
  62
  /* > */
];
function h(e, r, i, c) {
  for (let n = r; n < i; n++)
    if (!c(e.charCodeAt(n)))
      return !1;
  return !0;
}
function C(e, r, i, c = !1) {
  let n, s, o;
  for (n = r; n < i - 5; n++) {
    if (e.charCodeAt(n) === 123 && e.charCodeAt(n + 1) === 123) {
      o = !0;
      break;
    }
    if (c || e.charCodeAt(n) === 10)
      return !1;
  }
  if (!o)
    return !1;
  for (s = n + 2; s <= i; s++)
    if (e.charCodeAt(s - 1) == 125 && e.charCodeAt(s) == 125)
      return { start: n, end: s };
  return !1;
}
function f(e, r, i, c = !1) {
  const n = C(e, r, i, c);
  if (!n)
    return !1;
  const s = e.slice(n.start, n.end + 1), o = s.slice(2, -2), l = o.charCodeAt(0), u = d.includes(l), a = u ? !1 : l === k, t = u ? 1 : a ? -1 : 0, p = o.slice(t ? 1 : 0).trim(), m = t !== 0 || g.includes(l) ? String.fromCharCode(l) : null;
  return {
    opening: u,
    closing: a,
    nesting: t,
    mark: m,
    name: p,
    content: o,
    raw: s,
    pos: n
  };
}
function b(e, r, i, c) {
  let n, s, o, l, u = 0;
  for (o = i; o <= c && (n = e.bMarks[o] + e.tShift[o], s = e.eMarks[o], !(n < s && e.sCount[o] < e.blkIndent)); o++)
    if (!(e.sCount[o] - e.blkIndent >= 4) && (l = f(e.src, n, s, !0), !!l && h(
      e.src,
      l.pos.end + 1,
      e.eMarks[o],
      e.md.utils.isWhiteSpace
    )))
      if (l.closing && l.name === r.name) {
        if (u === 0) {
          l.line = o, l.block = !0;
          break;
        }
        u--;
      } else
        l.opening && l.name === r.name && u++;
  return l;
}
function M(e, r, i, c) {
  const n = e.bMarks[r] + e.tShift[r], s = e.eMarks[r], o = f(e.src, n, s, !0);
  if (!o || !o.opening || !h(
    e.src,
    o.pos.end + 1,
    s,
    e.md.utils.isWhiteSpace
  ))
    return !1;
  const l = b(e, o, r + 1, i);
  if (!l)
    return !1;
  if (!c) {
    const u = e.push("mustache_open", "", 1);
    u.block = !0, u.meta = { tag: o }, u.map = [r, l.line];
    const a = e.parentType, t = e.lineMax;
    e.parentType = "mustache_block", e.lineMax = l.line, e.md.block.tokenize(e, r + 1, l.line), e.parentType = a, e.lineMax = t;
    const p = e.push("mustache_close", "", -1);
    p.block = !0;
  }
  return e.line = l.line + 1, !0;
}
function _(e, r, i, c, n) {
  let s = e[r];
  if (s.nesting === -1)
    return "</details>";
  let o = s.meta.tag;
  return `<details><summary>${o.mark}${o.name}</summary>`;
}
function y(e, r = _) {
  e.block.ruler.after("fence", "mustache_block", M, {
    alt: ["paragraph", "reference", "blockquote", "list"]
  }), e.renderer.rules.mustache_open = r, e.renderer.rules.mustache_close = r;
}
function I(e, r, i, c) {
  let n, s = 0;
  for (let o = i; o < c - 5; ) {
    if (n = f(e, o, c), !n)
      return !1;
    if (n.closing && n.name === r.name) {
      if (s === 0)
        break;
      s--;
    } else
      n.opening && n.name === r.name && s++;
    o = n.pos.end + 1;
  }
  return n;
}
function T(e, r) {
  let i;
  const c = f(e.src, e.pos, e.posMax);
  if (!c)
    return !1;
  if (c.nesting === 0)
    return r || (i = e.push("mustache_inline", "", 0), i.meta = { tag: c }), e.pos = c.pos.end + 1, !0;
  if (c.closing)
    return r || (i = e.push("mustache_inline", "", 0), i.meta = { tag: c }), e.pos = c.pos.end + 1, !0;
  const n = I(
    e.src,
    c,
    c.pos.end + 1,
    e.posMax
  );
  return n ? (r || (i = e.push("mustache_inline_block", "", 0), i.children = [], e.md.inline.parse(
    e.src.slice(c.pos.end + 1, n.pos.start),
    e.md,
    {},
    i.children
  )), e.pos = n.pos.end + 1, !0) : (r || (i = e.push("mustache_inline", "", 0), i.meta = { tag: c }), e.pos = c.pos.end + 1, !0);
}
function x(e, r, i, c, n) {
  return `<span>${e[r].meta.tag.raw}</span>`;
}
function A(e, r, i, c, n) {
  const s = e[r];
  return `<span>${n.renderInline(s.children, i, c)}</span>`;
}
function B(e, r = x, i = A) {
  e.inline.ruler.push("mustache_inline", T), e.renderer.rules.mustache_inline = r, e.renderer.rules.mustache_inline_block = i;
}
export {
  y as mustacheBlock,
  B as mustacheInline
};
