# Simple JSON Type

This document attempts to describe data types (primarily aimed at JSON-like structures) in a simple and natural way.
Any [valid JSON](https://www.json.org/) could be validated against a **Simple JSON Type** definition.

## Reserved Keywords

There are several reserved words in **Simple JSON Type** which could be used either as keys or values:

| Keyword   | Description                                                                 | Usage      |
| --------- | --------------------------------------------------------------------------- | ---------- |
| string    | String type                                                                 | key, value |
| number    | Number type                                                                 | value      |
| boolean   | Boolean type                                                                | value      |
| null      | `null` value                                                                | value      |
| undefined | Value is not set (the corresponding key is not present)                     | value      |
| array     | Array generic                                                               | key        |
| any       | Any value (not validated)                                                   | value      |
| json      | Any valid JSON type (under consideration)                                   | value      |
| $merge    | Combines several types from an array into an object (types must be objects) | key        |
| $ref      | Reference to another field                                                  | key        |

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

## Arrays

Array literals allow defining multiple available options, one of which is applicable:

```json
["string", "number"]
```

## Types Combining

It is possible to combine several types into one using the `$merge` keyword:

```json
{
  "$merge": [{"foo": "string", "bar": "boolean"}, {"bar": "number"}]
}
```

Please notice that each item must be an object.
A result is an object with all the top-level keys from the items merged in the order of appearance in the array:

```json
{
  "foo": "string",
  "bar": "number"
}
```

## Literals Escaping

Whenever there is a need to use a literal value instead of a reserved keyword, it needs to be prepended with the `$literal:` prefix:

```json
{
  "$literal:string": "boolean"
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

<!-- TODO: consider this syntax: `$resolve(#/path)` or `$(#/path)` -->

## Json Type

Represents any valid JSON. It could be described in terms of **Simple JSON Type** as the following:

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

## Types Extending

Possible extensions described [here](./extensions.md)
