import markdownIt from "markdown-it";
import { mustacheBlock, mustacheInline } from "../lib/main";

const md = markdownIt().use(mustacheBlock).use(mustacheInline);
const input = document.querySelector("#input");
const preview = document.querySelector("#preview");

input.addEventListener("change", (event) => {
  let result = md.render(event.target.value);
  preview.innerHTML = result;
});

globalThis.md = md;
