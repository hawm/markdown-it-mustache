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
function f(e, o, c, a) {
  for (let n = o; n < c; n++)
    if (!a(e.charCodeAt(n)))
      return !1;
  return !0;
}
function b(e, o, c, a = !1) {
  let n, i, s;
  for (n = o; n < c - 5; n++) {
    if (e.charCodeAt(n) === 123 && e.charCodeAt(n + 1) === 123) {
      s = !0;
      break;
    }
    if (a || e.charCodeAt(n) === 10)
      return !1;
  }
  if (!s)
    return !1;
  for (i = n + 2; i <= c; i++)
    if (e.charCodeAt(i - 1) == 125 && e.charCodeAt(i) == 125)
      return { start: n, end: i };
  return !1;
}
function h(e, o, c, a = !1) {
  const n = b(e, o, c, a);
  if (!n)
    return !1;
  const i = e.slice(n.start, n.end + 1), s = i.slice(2, -2), r = s.charCodeAt(0), u = d.includes(r), l = u ? !1 : r === k, t = u ? 1 : l ? -1 : 0, m = s.slice(t ? 1 : 0).trim(), p = t !== 0 || g.includes(r) ? String.fromCharCode(r) : "";
  return {
    opening: u,
    closing: l,
    nesting: t,
    mark: p,
    name: m,
    content: s,
    raw: i,
    pos: n
  };
}
function C(e, o, c, a) {
  let n, i, s, r, u = 0;
  for (s = c; s <= a && (n = e.bMarks[s] + e.tShift[s], i = e.eMarks[s], !(n < i && e.sCount[s] < e.blkIndent)); s++)
    if (!(e.sCount[s] - e.blkIndent >= 4) && (r = h(e.src, n, i, !0), !!r && f(
      e.src,
      r.pos.end + 1,
      e.eMarks[s],
      e.md.utils.isWhiteSpace
    )))
      if (r.closing && r.name === o.name) {
        if (u === 0) {
          r.line = s, r.block = !0;
          break;
        }
        u--;
      } else
        r.opening && r.name === o.name && u++;
  return r;
}
function M(e, o, c, a) {
  const n = e.bMarks[o] + e.tShift[o], i = e.eMarks[o], s = h(e.src, n, i, !0);
  if (!s || !s.opening || !f(
    e.src,
    s.pos.end + 1,
    i,
    e.md.utils.isWhiteSpace
  ))
    return !1;
  const r = C(e, s, o + 1, c);
  if (!r)
    return !1;
  if (!a) {
    const u = e.push("mustache_block", "div", 1);
    u.block = !0, u.meta = { tag: s }, u.map = [o, r.line], u.attrs = [
      ["class", "mustache mustache-block"],
      ["data-mustache-name", s.name],
      ["data-mustache-mark", s.mark]
    ];
    const l = e.parentType, t = e.lineMax;
    e.parentType = "mustache_block", e.lineMax = r.line, e.md.block.tokenize(e, o + 1, r.line), e.parentType = l, e.lineMax = t;
    const m = e.push("mustache_block", "div", -1);
    m.block = !0, m.meta = { tag: r };
  }
  return e.line = r.line + 1, !0;
}
function T(e) {
  e.block.ruler.after("fence", "mustache_block", M, {
    alt: ["paragraph", "reference", "blockquote", "list"]
  });
}
function _(e, o, c, a) {
  let n, i = 0;
  for (let s = c; s < a - 5; s = n.pos.end + 1) {
    if (n = h(e, s, a), !n)
      return !1;
    if (n.closing && n.name === o.name) {
      if (i === 0)
        return n;
      i--;
    } else
      n.opening && n.name === o.name && i++;
  }
  return !1;
}
function x(e, o) {
  let c;
  if (e.src.charCodeAt(e.pos) !== 123)
    return !1;
  const a = h(e.src, e.pos, e.posMax);
  if (!a)
    return !1;
  if (a.nesting === 0)
    return o || (c = e.push("mustache_inline", "span", 0), c.meta = { tag: a }, c.attrs = [
      ["class", "mustache mustache-inline"],
      ["data-mustache-name", a.name],
      ["data-mustache-mark", a.mark]
    ]), e.pos = a.pos.end + 1, !0;
  if (a.closing)
    return o || (c = e.push("mustache_invalid", "span", 0), c.meta = { tag: a }, c.attrs = [
      ["class", "mustache mustache-inline mustache-invalid"],
      ["data-mustache-name", a.name],
      ["data-mustache-mark", a.mark],
      ["data-mustache-msg", "missing open tag"]
    ]), e.pos = a.pos.end + 1, !0;
  const n = _(
    e.src,
    a,
    a.pos.end + 1,
    e.posMax
  );
  return n ? (o || (c = e.push("mustache_inline_block", "span", 1), c.meta = { tag: a }, c.attrs = [
    ["class", "mustache mustache-inline mustache-inline-block"],
    ["data-mustache-name", a.name],
    ["data-mustache-mark", a.mark]
  ], e.pos = a.pos.end + 1, e.posMax = n.pos.start, e.md.inline.tokenize(e), e.pos = n.pos.end + 1, e.posMax = e.src.length, c = e.push("mustache_inline_block", "span", -1), c.meta = { tag: n }), e.pos = n.pos.end + 1, !0) : (o || (c = e.push("mustache_invalid", "span", 0), c.meta = { tag: a }, c.content = n.raw, c.attrs = [
    ["class", "mustache mustache-inline mustache-invalid"],
    ["data-mustache-name", a.name],
    ["data-mustache-mark", a.mark],
    ["data-mustache-msg", "missing close tag"]
  ]), e.pos = a.pos.end + 1, !0);
}
function A(e) {
  e.inline.ruler.push("mustache_inline", x);
}
export {
  T as mustacheBlock,
  A as mustacheInline
};
