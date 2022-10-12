import { html, render } from "https://unpkg.com/htm/preact/index.mjs?module";
import {
  useState,
  useMemo,
} from "https://unpkg.com/preact/hooks/dist/hooks.module.js?module";

const NUM_ITEMS = 1000000;

function App(props) {
  const [scrollTop, setScrollTop] = useState(0);

  const [lHeight, setLHeight] = useState(500);
  const [iHeight, setIHeight] = useState(20);
  const [buffer, setBuffer] = useState(10);

  const startIndex = Math.max(Math.floor(scrollTop / iHeight) - buffer, 0);
  const endIndex = Math.min(
    startIndex + Math.ceil(lHeight / iHeight) + 2 * buffer,
    NUM_ITEMS
  );

  const nodes = Array(endIndex - startIndex)
    .fill(0)
    .map((_, i) => {
      const absoluteIndex = startIndex + i;

      return html`<div
        style=${{
          position: "absolute",
          height: iHeight,
          top: absoluteIndex * iHeight,
          left: 0,
          backgroundColor: absoluteIndex % 2 === 0 ? "lightblue" : "lightgreen",
          color: "black",
          width: "100%",
          fontSize: 12,
        }}
      >
        Item #${absoluteIndex}, top: ${absoluteIndex * iHeight}
      </div>`;
    });

  return html` <div>
    <div
      style=${{
        display: "grid",
        gridTemplateColumns: ".5fr 1fr",
      }}
    >
      <label for="windowSize">Window Size:</label>
      <input
        id="windowSize"
        type="number"
        value=${lHeight}
        onInput=${(e) => setLHeight(Number(e.target.value))}
      />

      <label for="itemSize">Item Size:</label>
      <input
        id="itemSize"
        type="number"
        value=${iHeight}
        onInput=${(e) => setIHeight(Number(e.target.value))}
      />

      <label for="buffer">Buffer:</label>
      <input
        id="buffer"
        type="number"
        value=${buffer}
        onInput=${(e) => setBuffer(Number(e.target.value))}
      />
    </div>

    <div
      style=${{
        position: "relative",
        height: lHeight,
        width: "100%",
        overflow: "auto",
      }}
      onScroll=${(e) => setScrollTop(e.target.scrollTop)}
    >
      <div
        style=${{
          height: NUM_ITEMS * iHeight,
        }}
      >
        ${nodes}
      </div>
    </div>
  </div>`;
}

export default function (el) {
  render(html`<${App} />`, el);
}
