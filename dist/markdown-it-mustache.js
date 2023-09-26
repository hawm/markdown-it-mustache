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
function f(e, o, i, a) {
  for (let n = o; n < i; n++)
    if (!a(e.charCodeAt(n)))
      return !1;
  return !0;
}
function _(e, o, i, a = !1) {
  let n, s, r;
  for (n = o; n < i - 5; n++) {
    if (e.charCodeAt(n) === 123 && e.charCodeAt(n + 1) === 123) {
      r = !0;
      break;
    }
    if (a || e.charCodeAt(n) === 10)
      return !1;
  }
  if (!r)
    return !1;
  for (s = n + 2; s <= i; s++)
    if (e.charCodeAt(s - 1) == 125 && e.charCodeAt(s) == 125)
      return { start: n, end: s };
  return !1;
}
function m(e, o, i, a = !1) {
  const n = _(e, o, i, a);
  if (!n)
    return !1;
  const s = e.slice(n.start, n.end + 1), r = s.slice(2, -2), c = r.charCodeAt(0), u = d.includes(c), l = u ? !1 : c === k, t = u ? 1 : l ? -1 : 0, h = r.slice(t ? 1 : 0).trim(), p = t !== 0 || g.includes(c) ? String.fromCharCode(c) : "";
  return {
    opening: u,
    closing: l,
    nesting: t,
    mark: p,
    name: h,
    content: r,
    raw: s,
    pos: n
  };
}
function C(e, o, i, a) {
  let n, s, r, c, u = 0;
  for (r = i; r <= a && (n = e.bMarks[r] + e.tShift[r], s = e.eMarks[r], !(n < s && e.sCount[r] < e.blkIndent)); r++)
    if (!(e.sCount[r] - e.blkIndent >= 4) && (c = m(e.src, n, s, !0), !!c && f(
      e.src,
      c.pos.end + 1,
      e.eMarks[r],
      e.md.utils.isWhiteSpace
    )))
      if (c.closing && c.name === o.name) {
        if (u === 0) {
          c.line = r, c.block = !0;
          break;
        }
        u--;
      } else
        c.opening && c.name === o.name && u++;
  return c;
}
function M(e, o, i, a) {
  const n = e.bMarks[o] + e.tShift[o], s = e.eMarks[o], r = m(e.src, n, s, !0);
  if (!r || !r.opening || !f(
    e.src,
    r.pos.end + 1,
    s,
    e.md.utils.isWhiteSpace
  ))
    return !1;
  const c = C(e, r, o + 1, i);
  if (!c)
    return !1;
  if (!a) {
    const u = e.push("mustache_open", "", 1);
    u.block = !0, u.meta = { tag: r }, u.map = [o, c.line];
    const l = e.parentType, t = e.lineMax;
    e.parentType = "mustache_block", e.lineMax = c.line, e.md.block.tokenize(e, o + 1, c.line), e.parentType = l, e.lineMax = t;
    const h = e.push("mustache_close", "", -1);
    h.block = !0;
  }
  return e.line = c.line + 1, !0;
}
function b(e, o, i, a, n) {
  const s = e[o], r = s.tag || "div";
  if (s.nesting === -1)
    return `</${r}>`;
  const c = s.meta.tag;
  return `<${r} class="mustache mustache-block" data-mustache-name=${c.name}   data-mustache-mark=${c.mark}>`;
}
function I(e, o = b) {
  e.block.ruler.after("fence", "mustache_block", M, {
    alt: ["paragraph", "reference", "blockquote", "list"]
  }), e.renderer.rules.mustache_open = o, e.renderer.rules.mustache_close = o;
}
function $(e, o, i, a) {
  let n, s = 0;
  for (let r = i; r < a - 5; r = n.pos.end + 1) {
    if (n = m(e, r, a), !n)
      return !1;
    if (n.closing && n.name === o.name) {
      if (s === 0)
        return n;
      s--;
    } else
      n.opening && n.name === o.name && s++;
  }
  return !1;
}
function x(e, o) {
  let i;
  if (e.src.charCodeAt(e.pos) !== 123)
    return !1;
  const a = m(e.src, e.pos, e.posMax);
  if (!a)
    return !1;
  if (a.nesting === 0)
    return o || (i = e.push("mustache_inline", "span", 0), i.meta = { tag: a }), e.pos = a.pos.end + 1, !0;
  if (a.closing)
    return o || (i = e.push("mustache_inline", "span", 0), i.meta = { tag: a }), e.pos = a.pos.end + 1, !0;
  const n = $(
    e.src,
    a,
    a.pos.end + 1,
    e.posMax
  );
  return n ? (o || (i = e.push("mustache_inline_open", "span", 1), i.meta = { tag: a }, e.pos = a.pos.end + 1, e.posMax = n.pos.start, e.md.inline.tokenize(e), e.pos = n.pos.end + 1, e.posMax = e.src.length, e.push("mustache_inline_close", "span", -1)), e.pos = n.pos.end + 1, !0) : (o || (i = e.push("mustache_inline", "span", 0), i.meta = { tag: a }), e.pos = a.pos.end + 1, !0);
}
function T(e, o, i, a, n) {
  const s = e[o], r = s.tag || "span", c = s.meta.tag;
  return `<${r} class="mustache mustache-inline" data-mustache-name="${c.name}"   data-mustache-mark="${c.mark}"></${r}>`;
}
function A(e, o, i, a, n) {
  const s = e[o], r = s.tag || "span";
  if (s.nesting === -1)
    return `</${r}>`;
  const c = s.meta.tag;
  return `<${r} class="mustache mustache-inline mustache-inline-block"   data-mustache-name="${c.name}" data-mustache-mark=${c.mark}>`;
}
function O(e, o = T, i = A) {
  e.inline.ruler.push("mustache_inline", x), e.renderer.rules.mustache_inline = o, e.renderer.rules.mustache_inline_open = i, e.renderer.rules.mustache_inline_close = i;
}
export {
  I as mustacheBlock,
  O as mustacheInline
};
