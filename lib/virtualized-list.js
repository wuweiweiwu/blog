import { html, render } from "https://unpkg.com/htm/preact/index.mjs?module";
import {
  useState,
  useMemo,
} from "https://unpkg.com/preact/hooks/dist/hooks.module.js?module";

const ITEM_HEIGHT = 40;
const LIST_HEIGHT = 500;
const NUM_ITEMS = 10000;
const BUFFER = 10;

function App(props) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER, 0);
  const endIndex = Math.min(
    startIndex + Math.ceil(LIST_HEIGHT / ITEM_HEIGHT) + 2 * BUFFER,
    NUM_ITEMS
  );

  const nodes = Array(endIndex - startIndex)
    .fill(0)
    .map((_, i) => {
      const absoluteIndex = startIndex + i;

      return html`<div
        style=${{
          position: "absolute",
          height: ITEM_HEIGHT,
          top: absoluteIndex * ITEM_HEIGHT,
          left: 0,
          backgroundColor: absoluteIndex % 2 === 0 ? "lightblue" : "lightgreen",
          color: "var(--color-gray-20)",
          width: "100%",
        }}
      >
        Item #${absoluteIndex}
      </div>`;
    });

  return html`<div
    style=${{
      position: "relative",
      height: LIST_HEIGHT,
      width: "100%",
      overflow: "auto",
    }}
    onScroll=${(e) => setScrollTop(e.target.scrollTop)}
  >
    <div style=${{ height: NUM_ITEMS * ITEM_HEIGHT }}>${nodes}</div>
  </div>`;
}

export default function (el) {
  render(html`<${App} />`, el);
}
