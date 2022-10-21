---
title: Practical TypeScript Generics
description: Some real-world examples of TypeScript generic types at work
date: 2022-10-21
tags: typescript
layout: layouts/post.njk
draft: true
---

It's been ten years since TypeScript was first released to the public. Since then, tons of developers have gradually adopted it, both in personal projects and at work. One of the more confusing and complex aspects of TypeScript is its support for generic types. Generics can be described as "type variables". They can be used to create classes, functions, and types that make it easier to write reusable code. This blog post dives into a couple of TypeScript generic utilities and use cases that I've found invaluable.

## Generic Predicate Function

Say in your application logic, you need to filter out falsy values from an array. How can you do that in a type-safe way? I'd reach for [`Array.prototype.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), where you can pass in a predicate function to filter out falsy values. The implementation would be something like the following:

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

First let's define a type for falsy values. Falsy values in JavaScript are `false`, `0`, `null`, `""`, and `undefined`. For our predicate function `truthy`, we can define the parameter type as our generic input type `T` unioned with our `Falsy` type. By defining the parameter type as a union, we can extract the truthy type as the output type parameter.

Then we assert the output type is the extracted truthy type by using the `is` keyword which is something called a [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates). We can use type predicates to narrow a type. In this case, we are asserting that the parameter `value` is of type `T`, the extracted truthy type.

As you can see, the body of the predicate function is the same as in the first example, the only difference is the type signature. Let's test it out.

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

With this new predicate function, `truthyValues` now have the correct signature that we desire. We are now able to filter falsy values out from variable-typed arrays while inferring the correct truthy type.

## Generic React Component

I've been mostly working with React + TypeScript apps for the past couple of years. And one thing that always pops up is generic React components. Let's see how we can use these two technologies together.

It's worth noting that to use JSX syntax in TypeScript, you must use the file extension `.tsx`. There are also some weird caveats especially related to generics. The TypeScript parser has a hard time disambiguating between JSX and generic syntax. However, there is [a simple workaround](https://github.com/microsoft/TypeScript/issues/15713#issuecomment-499474386).

If we wanted to define a generic list component that can render lists of arbitrary objects, this is what it would look like.

```tsx twoslash
type ListProps<T> = {
  data: T[];
  getDatumString: (datum: T) => string;
};

const List = <T extends object>(props: ListProps<T>) => {
  return (
    <ul>
      {props.data.map((datum) => (
        <li>{props.getDatumString(datum)}</li>
      ))}
    </ul>
  );
};

const data = [
  //  ^?
  { id: "test1", name: "test1 name" },
  { id: "test2", name: "test2 name" },
];

const el = (
  <List
    data={data}
    getDatumString={(datum) => datum.name}
    //               ^?
  />
);
```

You can see that `getDatumString` is typed correctly based on the inferred data type `T` from `data`. Note that we are not using the official React typings from `@types/react` to annotate `List`. To parameterize the types, we must define functional components as generic functions without annotating them as `React.FunctionalComponent`.

Let's dive into a more complicated example, polymorphic React components.

```tsx twoslash
import { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

type BoxProps<T extends ElementType> = {
  //                    ^?
  as?: T;
  children?: ReactNode;
};

const Box = <T extends ElementType = "div">(
  props: BoxProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof BoxProps<T>>
) => {
  const { as, ...rest } = props;

  const Component = as || "div";

  return <Component {...rest} />;
};

// box as a link
const linkEl = <Box as="a" href="#" />;
//                         ^?

const Test = (props: { name: string }) => <div>{props.name}</div>;

// @errors: 2741
// as another component
const testEl = <Box as={Test} />;
```

We've parameterized the `as` prop to be of type `ElementType` which allows us to render the `Box` as any possible components or DOM elements. By using `ComponentPropsWithoutRef`, the `Box` component will also inherit any props that come from `as` in a type-safe way. For example, the `Test` component requires a `name` prop, and if that prop is not specified on `Box` when `Test` is passed as `as`, TypeScript will error.

This pattern is especially prevalent in third-party UI libraries such as [`chakra-ui`](https://chakra-ui.com/) and [`mui`](https://mui.com/).

## Conclusion

Above are a couple of examples of TypeScript generic usage that I've found to be beneficial day to day. I hope you find them helpful as well! If you're interested in how I set up my TypeScript code samples in this blog post, check out [Shiki-Twoslash](https://shikijs.github.io/twoslash/).
