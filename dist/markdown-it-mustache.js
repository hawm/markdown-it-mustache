const h = [
  35,
  94
  /* ^ */
], m = 47;
function t(n, i, s, o) {
  for (let e = i; e < s; e++)
    if (!o(n.charCodeAt(e)))
      return !1;
  return !0;
}
function d(n, i, s, o = !1) {
  let e, c, r;
  for (e = i; e < s - 5; e++) {
    if (n.charCodeAt(e) === 123 && n.charCodeAt(e + 1) === 123) {
      r = !0;
      break;
    }
    if (o || n.charCodeAt(e) === 10)
      return !1;
  }
  if (!r)
    return !1;
  for (c = e + 2; c <= s; c++)
    if (n.charCodeAt(c - 1) == 125 && n.charCodeAt(c) == 125)
      return { start: e, end: c };
  return !1;
}
function p(n, i, s, o = !1) {
  const e = d(n, i, s, o);
  if (!e)
    return !1;
  const c = n.slice(e.start, e.end + 1), r = c.slice(2, -2), u = h.includes(r.charCodeAt(0)), l = r.charCodeAt(0) === m, a = u ? 1 : l ? -1 : 0, f = r.slice(Math.abs(a));
  return {
    opening: u,
    closing: l,
    nesting: a,
    name: f,
    raw: c,
    pos: e
  };
}
function k(n, i, s, o) {
  let e, c, r, u, l = 0;
  for (r = s; r <= o && (e = n.bMarks[r] + n.tShift[r], c = n.eMarks[r], !(e < c && n.sCount[r] < n.blkIndent)); r++)
    if (!(n.sCount[r] - n.blkIndent >= 4) && (u = p(n.src, e, c, !0), !!u && t(
      n.src,
      u.pos.end + 1,
      n.eMarks[r],
      n.md.utils.isWhiteSpace
    )))
      if (u.closing && u.name === i.name) {
        if (l === 0) {
          u.line = r, u.block = !0;
          break;
        }
        l--;
      } else
        u.opening && u.name === i.name && l++;
  return u;
}
function g(n, i, s, o) {
  const e = n.bMarks[i] + n.tShift[i], c = n.eMarks[i], r = p(n.src, e, c, !0);
  if (!r || !r.opening || !t(
    n.src,
    r.pos.end + 1,
    c,
    n.md.utils.isWhiteSpace
  ))
    return !1;
  const u = k(n, r, i + 1, s);
  if (!u)
    return !1;
  if (!o) {
    const l = n.push("mustache_open", "div", 1);
    l.map = [i, u.line];
    const a = n.parentType, f = n.lineMax;
    n.parentType = "mustache_block", n.lineMax = u.line, n.md.block.tokenize(n, i + 1, u.line), n.parentType = a, n.lineMax = f, n.push("mustache_close", "div", -1);
  }
  return n.line = u.line + 1, !0;
}
function _(n) {
  n.block.ruler.after("fence", "mustache-block", g, {
    alt: ["paragraph", "reference", "blockquote", "list"]
  });
}
function M(n, i, s, o) {
  let e, c = 0;
  for (let r = s; r < o - 5; ) {
    if (e = p(n, r, o), !e)
      return !1;
    if (e.closing && e.name === i.name) {
      if (c === 0)
        break;
      c--;
    } else
      e.opening && e.name === i.name && c++;
    r = e.pos.end + 1;
  }
  return e;
}
function C(n, i) {
  let s;
  const o = p(n.src, n.pos, n.posMax);
  if (!o)
    return !1;
  if (o.nesting === 0)
    return i || (s = n.push("mustache_inline", "span", 0), s.meta = { tag: o }), n.pos = o.pos.end + 1, !0;
  if (o.closing)
    return i || (s = n.push("mustache_inline", "span", 0), s.meta = { tag: o }), n.pos = o.pos.end + 1, !0;
  const e = M(
    n.src,
    o,
    o.pos.end + 1,
    n.posMax
  );
  return e ? (i || (n.push("mustache_open", "span", 1), n.pos = o.pos.end + 1, n.posMax = e.pos.start, n.md.inline.tokenize(n), n.posMax = n.src.length, n.push("mustache_close", "span", -1)), n.pos = e.pos.end + 1, !0) : (i || (s = n.push("mustache_inline", "span", 0), s.meta = { tag: o }), n.pos = o.pos.end + 1, !0);
}
function b(n, i, s, o, e) {
  return `<span>${n[i].meta.tag.raw}</span>`;
}
function x(n) {
  n.inline.ruler.push("mustache-inline", C), n.renderer.rules.mustache_inline = b;
}
export {
  _ as mustacheBlock,
  x as mustacheInline
};
