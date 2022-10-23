---
title: Rendering a Million Rows Without Crashing Your Browser
description: Deep dive into list virtualization
date: 2022-10-11
tags: performance
layout: layouts/post.njk
---

Have you ever tried rendering a list or table with millions of rows and wondered why the frame rate hit the gutter? Me too.

Let me introduce virtualization (aka windowing). This technique only renders the currently visible items to improve performance. You maintain a "window", and as the user scrolls, it moves up or down. Items that are positioned within the "window" are then dynamically rendered. All items outside of the window are ignored.

There are some tricks that developers use to give users the illusion that they are scrolling a regular list. With a virtualized list, the size of the "window" must be known. Another piece of information that we need to know is the size of the item as well as the total number of items. We can imitate scroll by creating a fake scroll placeholder container that is the total size of the list and placing it within the "window" container so that it naturally `overflow: scroll;`.

```js
const ITEM_SIZE = 40;
const LIST_SIZE = 500;
const NUM_ITEMS = 1_000_000;

const TOTAL_SIZE = ITEM_SIZE * NUM_ITEMS;
```

Now that we have a scrolling container, we need to position the items at their correct positions so that they are visible to the user. To determine which items are within the "window", we first must determine how much the scroll container has scrolled. We can read this from [`Element.scrollTop`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop). It also must update whenever the user scrolls so we also want to listen to an element's [`scroll`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scroll_event) event.

```js
const startIndex = Math.max(Math.floor(scrollTop / ITEM_SIZE), 0);

const endIndex = Math.min(
  startIndex + Math.ceil(LIST_SIZE / ITEM_SIZE),
  NUM_ITEMS
);
```

We can now also calculate the absolute position for each item within the "window".

```js
const top = itemIndex * ITEM_SIZE;
```

By placing each absolutely positioned element within the large scroll placeholder container, we can now take advantage of native scroll behavior but only render the visible items within the "window". To avoid showing a blank item when the user scrolls extremly fast, we can define a buffer, which is the number of items to render before the start of the window and after the end of the window. Below is an interactive example of how this all comes together.

<is-land autoinit="preact" import="/lib/virtualized-list.js"></is-land>

## Further Explorations

The above approach only solves the case of a fixed-size container with fixed item sizes. We can easily extend the above example to also handle horizontal scrolling. Another interesting problem appears when we have variable item sizes. There are various approaches to solving this problem. If the size is fixed but dynamic depending on the index we can work that into our math when calculating item indexes and offsets. If the size is dynamic depending on the content, which is unknown until rendered, one possible approach is to render and measure the item off-screen and use that value in index and offset calculations.

There are also many opportunities to cache calculations and item renders depending on the framework used. [`react-window`](https://github.com/bvaughn/react-window) is a popular library and provides an API that allows items to be memoized. Here is an [example](https://react-window.vercel.app/#/examples/list/memoized-list-items).
