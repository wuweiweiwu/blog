---
title: Demystifying Tree Shaking
description: Deep dive into how webpack handles tree shaking
date: 2022-10-09
tags: webpack
layout: layouts/post.njk
---

I recently discovered this [issue](https://github.com/webpack/webpack/issues/9337) on GitHub from 2019 where tree shaking in `webpack` wasn't working as expected. That took me down a rabbit hole of different [docs](https://webpack.js.org/guides/tree-shaking/) and [forums](https://stackoverflow.com/questions/55339256/tree-shaking-with-rollup) to get to a definitive answer.

But first, let's define what tree shaking is. I've always thought of it as "unused code should not be included in my final production bundle." Though that statement is technically correct, it lacks nuance.

With the introduction of `ES6`, we got modules and `import` `export` statements, which are statically analyzable and opened the door to many bundling optimizations. According to the [Module Spec](https://262.ecma-international.org/6.0/#sec-moduleevaluation), imported modules must have any side effects evaluated. However, that complicates how modern tools can effectively remove unused code. Take the following example.

```js
// Button.js
import { withHOC } from "lib";

var BaseButton = () => {};

var Button = withHOC()(BaseButton);

export default Button;
```

If `Button` is unused in your application code, it is safe to remove the `export` statement.

```diff-js
- export default Button;
```

That begs the question, "Is it safe to remove the rest of `Button.js`?". And the answer is we're not sure.

To be able to remove the rest of `Button.js`, our bundler must first determine whether evaluating this module is side effect free. For example, does invoking `withHOC` result in a side effect? Does invoking the return value of `withHOC` result in a side effect? Due to the dynamic nature of JavaScript, in most cases, tools like `rollup` and `terser` cannot reliably determine whether side effects are present. So that's why we sometimes have to give our tools some hints.

## `/*#__PURE__*/`

Have you ever seen this magic comment in your bundle and wondered what it does? Take the following example.

```js
// t.js
import { test } from "test-module";

const t = /*#__PURE__*/ test();

export { t };
```

By prepending an expression with this comment, we are telling our bundler that this statement is _pure_, or side effect free. That means if `t` is unused, it can safely remove the rest of `t.js` since there are no side effects.

## `usedExports`

This is a [webpack optimization](https://webpack.js.org/configuration/optimization/#optimizationusedexports) that relies on `terser` to detect side effects in statements. However, as stated earlier, it is difficult in JavaScript. This optimization is on by default in `production` mode.

## `sideEffects`

This is a `webpack` optimization that relies on a new field in `package.json` that specifies side effects (if any) for a whole package. Here are some examples.

```json
// package.json
{
  "sideEffects": false
}
```

```json
// package.json
{
  "sideEffects": ["index.css", "polyfill.js", "*.css"]
}
```

This is conceptually very similar to `/*#__PURE__*/`, but instead of operating at the statement level, it works on the module/file level. By specifying this property, you are telling `webpack` that specified files have side effects when imported while also informing which ones are pure and side effect free and thus can be easily optimized when exports are unused.

If a module is not flagged in `sideEffects` and no direct exports are used, the bundler can skip evaluating that module for side effects.

This allows `webpack` to drop whole modules and subtrees. Take the following example `ui` package.

```js
// util.js
export const getButtonProps = () => {
  return {
    id: "test",
  };
};
```

```js
// Box.js
import "./Box.css";
const Box = () => {
  return <div />;
};

export { Box };
```

```js
// Button.js
import { getButtonProps } from "./util";

const Button = () => {
  return <button {...getButtonProps()} />;
};

export { Button };
```

```js
// polyfill.js
import "regenerator-runtime";
```

```js
// index.js
import "./polyfill";
export { Button } from "./Button";
export { Box } from "./Box";
```

```json
// package.json
{
  "sideEffects": ["index.js", "polyfill.js"]
}
```

If in your application code, you have the following statement.

```js
import { Button } from "ui";
```

Here is how `webpack` decides which files to include.

| File          | Direct Export Used | Flagged with `sideEffects` | Included |
| ------------- | ------------------ | -------------------------- | -------- |
| `index.js`    | ❌                 | ✅                         | ✅       |
| `polyfill.js` | ❌                 | ✅                         | ✅       |
| `Box.js`      | ❌                 | ❌                         | ❌       |
| `Button.js`   | ✅                 | ❌                         | ✅       |
| `util.js`     | ✅                 | ❌                         | ✅       |

In the final bundle, only four files are included after the `sideEffects` optimization. After this, `webpack` can remove even more code via `usedExports` and `/*#__PURE__*/`.

## How to distribute libraries that are tree shakable

Here are a couple of things library authors can do to ensure their libraries can be optimized.

- Distribute ES6 `import` and `export` syntax for modern package [entrypoints](https://nodejs.org/api/packages.html#package-entry-points)
  - The `exports` field is the official modern alternative to `main`
  - The `module` field is community driven and not actually in the spec, but is supported by most bundlers
  - The `main` entrypoint is for ES5-compatible syntax
- Don't bundle into a single file, `sideEffects` work at a module/file level
  - Most of the time library authors can use `tsc` or `babel` to transpile code while keeping the module structure
  - `rollup` has a [`preserveModules`](https://rollupjs.org/guide/en/#outputpreservemodules) option that preserves individual files in the output
