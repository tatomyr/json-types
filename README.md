# Simple JSON Type

This is an attempt to describe data types (mostly aimed at JSON-like structures) in a simple and natural way.
Any [valid JSON](https://www.json.org/) could be validated against a **simple-json-type** definition.

## Reserved Keywords

There are several reserved words in **Simple JSON Type**.

| Keyword | Description                                                            | Usage      |
| ------- | ---------------------------------------------------------------------- | ---------- |
| string  | String type                                                            | key, value |
| number  | Number type                                                            | value      |
| boolean | Boolean type                                                           | value      |
| null    | Both `null` value and type; also represents `undefined` value and type | value      |
| array   | Array type                                                             | key        |
| any     | Any type                                                               | value      |
| all     | Combines several types into one (types must be objects)                | key        |
| $ref    | Reference to another type                                              | key        |

## Objects

Object literals are used to describe literal object-like schemas:

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

Note that string keys that could be converted to numbers will also be checked as numbers to validate tuple-like arrays:

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

## Literals Escaping

Whenever there is a need to use a literal value instead of a reserved keyword, it needs to be prepended with `$literal:` prefix:

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

## Any

Represents any valid JSON. It could be described in terms of **simple-json-type** as:

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
