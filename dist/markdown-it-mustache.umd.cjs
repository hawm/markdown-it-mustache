(function(l,f){typeof exports=="object"&&typeof module<"u"?f(exports):typeof define=="function"&&define.amd?define(["exports"],f):(l=typeof globalThis<"u"?globalThis:l||self,f(l.MarkdownItMustache={}))})(this,function(l){"use strict";const k=[35,94],g=47,b=[33,38,62];function m(e,r,c,i){for(let n=r;n<c;n++)if(!i(e.charCodeAt(n)))return!1;return!0}function M(e,r,c,i=!1){let n,s,o;for(n=r;n<c-5;n++){if(e.charCodeAt(n)===123&&e.charCodeAt(n+1)===123){o=!0;break}if(i||e.charCodeAt(n)===10)return!1}if(!o)return!1;for(s=n+2;s<=c;s++)if(e.charCodeAt(s-1)==125&&e.charCodeAt(s)==125)return{start:n,end:s};return!1}function p(e,r,c,i=!1){const n=M(e,r,c,i);if(!n)return!1;const s=e.slice(n.start,n.end+1),o=s.slice(2,-2),u=o.charCodeAt(0),t=k.includes(u),h=t?!1:u===g,a=t?1:h?-1:0,d=o.slice(a?1:0).trim(),O=a!==0||b.includes(u)?String.fromCharCode(u):null;return{opening:t,closing:h,nesting:a,mark:O,name:d,content:o,raw:s,pos:n}}function C(e,r,c,i){let n,s,o,u,t=0;for(o=c;o<=i&&(n=e.bMarks[o]+e.tShift[o],s=e.eMarks[o],!(n<s&&e.sCount[o]<e.blkIndent));o++)if(!(e.sCount[o]-e.blkIndent>=4)&&(u=p(e.src,n,s,!0),!!u&&m(e.src,u.pos.end+1,e.eMarks[o],e.md.utils.isWhiteSpace)))if(u.closing&&u.name===r.name){if(t===0){u.line=o,u.block=!0;break}t--}else u.opening&&u.name===r.name&&t++;return u}function _(e,r,c,i){const n=e.bMarks[r]+e.tShift[r],s=e.eMarks[r],o=p(e.src,n,s,!0);if(!o||!o.opening||!m(e.src,o.pos.end+1,s,e.md.utils.isWhiteSpace))return!1;const u=C(e,o,r+1,c);if(!u)return!1;if(!i){const t=e.push("mustache_open","",1);t.block=!0,t.meta={tag:o},t.map=[r,u.line];const h=e.parentType,a=e.lineMax;e.parentType="mustache_block",e.lineMax=u.line,e.md.block.tokenize(e,r+1,u.line),e.parentType=h,e.lineMax=a;const d=e.push("mustache_close","",-1);d.block=!0}return e.line=u.line+1,!0}function T(e,r,c,i,n){let s=e[r];if(s.nesting===-1)return"</details>";let o=s.meta.tag;return`<details><summary>${o.mark}${o.name}</summary>`}function I(e,r=T){e.block.ruler.after("fence","mustache_block",_,{alt:["paragraph","reference","blockquote","list"]}),e.renderer.rules.mustache_open=r,e.renderer.rules.mustache_close=r}function y(e,r,c,i){let n,s=0;for(let o=c;o<i-5;){if(n=p(e,o,i),!n)return!1;if(n.closing&&n.name===r.name){if(s===0)break;s--}else n.opening&&n.name===r.name&&s++;o=n.pos.end+1}return n}function x(e,r){let c;const i=p(e.src,e.pos,e.posMax);if(!i)return!1;if(i.nesting===0)return r||(c=e.push("mustache_inline","",0),c.meta={tag:i}),e.pos=i.pos.end+1,!0;if(i.closing)return r||(c=e.push("mustache_inline","",0),c.meta={tag:i}),e.pos=i.pos.end+1,!0;const n=y(e.src,i,i.pos.end+1,e.posMax);return n?(r||(c=e.push("mustache_inline_block","",0),c.children=[],e.md.inline.parse(e.src.slice(i.pos.end+1,n.pos.start),e.md,{},c.children)),e.pos=n.pos.end+1,!0):(r||(c=e.push("mustache_inline","",0),c.meta={tag:i}),e.pos=i.pos.end+1,!0)}function S(e,r,c,i,n){return`<span>${e[r].meta.tag.raw}</span>`}function A(e,r,c,i,n){const s=e[r];return`<span>${n.renderInline(s.children,c,i)}</span>`}function B(e,r=S,c=A){e.inline.ruler.push("mustache_inline",x),e.renderer.rules.mustache_inline=r,e.renderer.rules.mustache_inline_block=c}l.mustacheBlock=I,l.mustacheInline=B,Object.defineProperty(l,Symbol.toStringTag,{value:"Module"})});
