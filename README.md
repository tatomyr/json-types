# Open JSON Type

This document attempts to describe data types (primarily aimed at JSON-like structures) in a simple and natural way.
Any [valid JSON](https://www.json.org/) could be validated against a **Open JSON Type** definition.

## Reserved Keywords

There are several reserved words in **Open JSON Type** which could be used either as keys or values:

| Keyword                   | Description                                                                  | Usage      |
| ------------------------- | ---------------------------------------------------------------------------- | ---------- |
| string                    | String type.                                                                 | key, value |
| number                    | Number type.                                                                 | value      |
| boolean                   | Boolean type.                                                                | value      |
| null                      | `null` value.                                                                | value      |
| undefined                 | Value is not set (the corresponding key is not present).                     | value      |
| array                     | Array generic.                                                               | key        |
| any                       | Any value (not validated).                                                   | value      |
| $and <!-- Maybe $all? --> | Combines several types from an array into an object (types must be objects). | key        |
| $ref                      | Reference to another field.                                                  | key        |

## Objects

Object literals describe object-like schemas:

```json
{
  "name": "string",
  "age": "number"
}
```

Also, it is possible to use the `string` type as a key to describe records:

```json
{
  "string": "any"
}
```

<!-- TODO: consider validating tuples as objects with integer-like keys, e.g.:

```json
{
  "0": "number",
  "1": "number"
}
```
-->

## Arrays

Array literals allow defining multiple available options, one of which is applicable:

```json
["string", "number"]
```

The relation between the items is logical **OR**.

## Types Combining

It is possible to combine several types into one using the `$and` keyword:

```json
{
  "$and": [{"foo": "string"}, {"bar": "number"}]
}
```

A result is an object that contains all of the properties from all of the items:

```json
{
  "foo": "string",
  "bar": "number"
}
```

Please notice that each item must be an object.

A TypeScript analogy of the `$and` operator is the following:

````ts
type And<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type Combined = And<{foo: string} | {bar: number}>
```

Effectively it applies the logical **AND** operation upon the array members, replacing the logical **OR** relations.

Note, that it doesn't make sense to combine objects that have common properties with different types:

```json
{
  "$and": [{"foo": "string"}, {"foo": "number"}]
}
````

The example above results in `foo` being both `string` and `number` what is effectively equivalent to TypeScript's `never` type.

## Literals Escaping

Whenever there is a need to use a literal value instead of a reserved keyword, it needs to be prepended with the `$literal::` prefix:

```json
{
  "$literal::string": "boolean"
}
```

This will check for an object with the `string` key of a `boolean` value, e.g.:

```json
{
  "string": true
}
```

## References

It is possible to use references to refer to other fields:

```json
{
  "$ref": "#/path/to/field"
}
```

An object containing a `$ref` will be substituted with the resolved content so that all other fields will be ignored.

A reference must be resolved relative to the file it appears in.

<!-- TODO: consider this syntax: `$resolve(#/path)` or `$(#/path)` -->

<!--
## Json Type

Represents any valid JSON.

Q: Is there real need to have both `any` and `json`? What else apart from json could be in any and still it is valid? `{array: "undefined"}`?
Anyway, it could be described in terms of **Open JSON Type** as the following:

```json
[
  "string",
  "number",
  "boolean",
  null,
  {"string": {"$ref": "#/"}},
  {"array": {"$ref": "#/"}}
]
```
-->

## Types Extending

Possible extensions described [here](./extensions.md)
