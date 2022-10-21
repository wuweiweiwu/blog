---
title: Practical TypeScript Generics
description: Some examples of real world use cases for TypeScript generic types
date: 2022-10-21
tags: typescript
layout: layouts/post.njk
draft: true
---

```tsx twoslash
type Props<T extends string> = {
  data: T[];
};

const MyTitle = <T extends string>(props: Props<T>) => <h1>Title</h1>;
const bob = <MyTitle data={[]} />;
```
