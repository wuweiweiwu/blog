---
title: Practical TypeScript Generics
description: Some real world examples of TypeScript generic types at work
date: 2022-10-21
tags: typescript
layout: layouts/post.njk
draft: true
---

It's been ten years since TypeScript was first released to the public. Since then, tons of developers have gradually adopted it, both in personal projects and at work. One of the more confusing and complex aspects of TypeScript is it's support for generic types. Generics can be described as "type variables". They can be used to create classes, functions, and types that make it easier to write reusable code. This blog post dives into a couple of TypeScript generic utilities and use cases that I've found to be invaluable.

## Generic Predicate Function

Say in your application logic, you need to filter out falsy values from an array. How can you do that in a type safe way? I'd reach for [`Array.prototype.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), where you can pass in a predicate function to filter out falsy values. The implementation would be something like the following:

```ts twoslash
const possibleNullishValues = [null, "1", "2"];
//    ^?
const truthyValues = possibleNullishValues.filter((value) => !!value);
//    ^?
```

However, `truthyValues`'s type is still the same as `possibleNullishValues` even though the values are properly truthy, which isn't what we want. If we wanted to operate on items within `truthyValues`, we would need to add another truthy check, which kind of defeats the purpose of doing the filter earlier.

```ts twoslash
const possibleNullishValues = [null, "1", "2"];
const truthyValues = possibleNullishValues.filter((value) => !!value);

// ---cut---

// @errors: 2531
truthyValues.forEach((value) => {
  console.log(value.length);

  // we have to do another check here >:(
  if (value) {
    console.log(value.length);
    //          ^?
  }
});
```

Turns out we can leverage the power of generics to make this better.

```ts twoslash
type Falsy = false | 0 | "" | null | undefined;

const truthy = <T>(value: T | Falsy): value is T => {
  return !!value;
};
```

First lets define a type for falsy values. Falsy values in JavaScript are `false`, `0`, `null`, `""`, and `undefined`. For our predicate function `truthy`, we can define the parameter type as our generic input type `T` unioned with our `Falsy` type. By defining the parameter type as a union, we can extract the truthy type out as the output type parameter.

Then we assert the output type is the extracted truthy type by using the `is` keyword which is something called a [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates). We can use type predicates to narrow a type. In this case, we are asserting that the parameter `value` is of type `T`, the extracted truthy type.

As you can see, the body of the predicate function is the same as the first example, the only difference is the type signature. Let's test it out.

```ts twoslash
type Falsy = false | 0 | "" | null | undefined;

const truthy = <T>(value: T | Falsy): value is T => {
  return !!value;
};

// ---cut---

const possibleNullishValues = [null, "1", "2"];
//    ^?
const truthyValues = possibleNullishValues.filter(truthy);
//    ^?

truthyValues.forEach((value) => {
  console.log(value.length);
});
```

With this new predicate function, `truthyValues` now have the correct signature that we desire. And we are able to operate on items within the array without TypeScript erroring out.

## Generic React Component
