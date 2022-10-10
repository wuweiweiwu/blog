import { html, render } from "https://unpkg.com/htm/preact/index.mjs?module";
import {
  useState,
  useMemo,
} from "https://unpkg.com/preact/hooks/dist/hooks.module.js?module";

const ITEM_HEIGHT = 40;
const LIST_HEIGHT = 500;
const LIST_WIDTH = 400;

const NUM_ITEMS = 10000;

function App(props) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  const endIndex = Math.min(
    startIndex + Math.ceil(LIST_HEIGHT / ITEM_HEIGHT),
    NUM_ITEMS
  );

  const nodes = useMemo(() => {
    return Array(endIndex - startIndex)
      .fill(0)
      .map((_, i) => {
        const absoluteIndex = startIndex + i;

        return html`<div
          style=${{
            position: "absolute",
            height: ITEM_HEIGHT,
            top: absoluteIndex * ITEM_HEIGHT,
            left: 0,
            backgroundColor:
              absoluteIndex % 2 === 0 ? "lightblue" : "lightgreen",
            width: "100%",
          }}
        >
          Item #${absoluteIndex}
        </div>`;
      });
  }, [startIndex, endIndex]);

  return html`<div
    style=${{
      position: "relative",
      height: LIST_HEIGHT,
      width: LIST_WIDTH,
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
