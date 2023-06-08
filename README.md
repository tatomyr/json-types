# Simple JSON Type

This is an attempt to describe data types (mostly aimed at JSON-like structures) in a simple and natural way.
Any [valid JSON](https://www.json.org/) could be validated against a **simple-json-type** definition.

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
| all       | Combines several types from an array into an object (types must be objects) | key        |
| $ref      | Reference to another type                                                   | key        |

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

Note that string keys that could be converted to integers are also treated as those to validate tuple-like arrays:

```json
{
	"0": "string",
	"1": "string"
}
```

## Arrays

Array literals allow defining multiple available options, one of which is applicable:

```json
["string", "number"]
```

## Types Combining

It is possible to combine several types into one using the `all` keyword:

```json
{
	"all": [{"foo": "string", "bar": "boolean"}, {"bar": "number"}]
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

References are used to refer to other fields:

```json
{
	"$ref": "#/path/to/field"
}
```

An object containing a `$ref` must not contain any other keys.

## Json Type

Represents any valid JSON. It could be described in terms of **simple-json-type** as the following:

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
