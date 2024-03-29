# JSON X-Types

This document attempts to describe data types (primarily aimed at JSON-like structures) in a simple and natural way.
Any [valid JSON](https://www.json.org/) could be validated against an **JSON X-Types** definition.

## Reserved Keywords

There are several reserved words in **JSON X-Types** which could be used either as keys or values:

| Keyword   | Description                                                | Usage      |
| --------- | ---------------------------------------------------------- | ---------- |
| string    | String type.                                               | key, value |
| number    | Number type.                                               | value      |
| boolean   | Boolean type.                                              | value      |
| null      | The `null` value.                                          | value      |
| undefined | Value is not set (the corresponding key is not present).   | value      |
| array     | Array generic.                                             | key        |
| any       | Any value (not validated).                                 | value      |
| $and      | Sets the logical `AND` relation between the array members. | key        |
| $literal  | Escapes a literal value.                                   | key, value |
| $x-type   | Refers to another `x-type`.                                | value      |

## Objects

Object literals describe object-like schemas:

```json
{
  "name": "string",
  "age": "number"
}
```

The example above defines an object with only two properties, both of which are required.

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
["string", "undefined"]
```

The relation between the items is logical `OR`.

## Types Combining

It is possible to combine several types into one using the `$and` keyword:

```json
{
  "$and": [{"foo": "string"}, {"bar": "number"}]
}
```

A result is an object that contains all of the properties of all the items:

```json
{
  "foo": "string",
  "bar": "number"
}
```

A TypeScript analogy of the `$and` operator is the following:

```ts
type And<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type Combined = And<{foo: string} | {bar: number}> // {"foo": "string"} & {"bar": "number"} ≡ {"foo": "string", "bar": "number"}
```

Effectively, it applies the logical `AND` operation upon the array members, replacing the logical `OR` relation.

Note that it doesn't make sense to combine primitive types or objects that have common properties with different types:

```json
{
  "$and": [{"foo": "string"}, {"foo": "number"}]
}
```

The example above results in `foo` being both `string` and `number`, effectively equivalent to TypeScript's `never` type.

## Literals Escaping

Whenever there is a need to use a literal string value instead of a reserved keyword, it needs to be prepended with the `$literal` prefix:

```json
{
  "$literal:string": "boolean"
}
```

This will check for an object with the `string` key of a `boolean` value, e.g.:

```json
{
  "string": true
}
```

## References

It is possible to refer to other **JSON X-Types** using the [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901) syntax:

```json
{
  "foo": "$x-type:#/path/to/field"
}
```

The `$x-type:...` expression must be replaced with the value of the field it refers to.
A reference must be resolved relative to the file it appears in.

<!--
## Json Type

Represents any valid JSON.

Q: Is there a real need to have both `any` and `json`? What else apart from json could be in any and still it is valid? `{array: "undefined"}`?
Anyway, it could be described in terms of **JSON X-Types** as the following:

```json
[
  "string",
  "number",
  "boolean",
  null,
  {"string": "$x-type:#/"},
  {"array": "$x-type:#/"}
]
```
-->

## Types Extending

Possible extensions described [here](./extensions.md)
