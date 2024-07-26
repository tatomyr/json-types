# JSON X-Type

**JSON X-Type** is a data type format for describing JSON-like structures in a simple and natural way.
Any [valid JSON](https://www.json.org/) could be validated against a **JSON X-Type** definition.

## Reserved Keywords

| Keyword   | Description                                                                           | Usage      |
| --------- | ------------------------------------------------------------------------------------- | ---------- |
| string    | String type.                                                                          | key, value |
| number    | Number type.                                                                          | value      |
| boolean   | Boolean type.                                                                         | value      |
| `null`    | The `null` value. (Note that the string "null" value doesn't have a special meaning.) | value      |
| undefined | Value is not set (the corresponding key is not present).                              | value      |
| array     | Array generic.                                                                        | key        |
| any       | Any value (not validated).                                                            | value      |
| $and      | Refers to the intersection of an array members ([🔗](#types-combining)).              | key        |
| $ref      | Reference to another **JSON X-Type** ([🔗](#references)).                             | key        |
| $schema   | A literal JSON Schema definition ([🔗](#literal-schemas)).                            | key        |

The list could be extended with other `$`-prefixed keywords.
So it's a good idea to escape any custom keys that start with `$` using the `$literal` prefix ([🔗](#literals-escaping)).

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

Effectively, it applies the `AND` relation between the array members, replacing the `XOR` relation.

Note that it doesn't make sense to combine primitive types or objects that have common properties with different types:

```json
{
  "$and": [{"foo": "string"}, {"foo": "number"}]
}
```

The example above results in `foo` being both `string` and `number`, effectively equivalent to TypeScript's `never` type.

The `$schema` properties also cannot be combined using the `$and` notation.

Impossible combinations should result in the `undefined` type.

## Literals Escaping

Whenever there is a need to use a literal string value instead of a reserved keyword, it must be prepended with the `$literal:` prefix:

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
  "foo": {"$ref": "#/path/to/field"}
}
```

A reference must be resolved relative to the file it appears in.
The `$ref` expression must be replaced with the value of the field it refers to.
Any other properties passed alongside the `$ref` must be ignored.

Alternatively, the `$ref` keyword could be used as a prefix which is easier to write and read (but the support is up to the implementation):

```json
{
  "foo": "$ref:#/path/to/field"
}
```

<!-- Q: Could it be used as a key? Does that even make sense? -->

If a reference is not resolved, it should be treated as `any`.

<!--
## Json Type

Represents any valid JSON.

Q: Is there a real need to have both `any` and `json`? What else apart from JSON could be in any and still it is valid? `{array: "undefined"}`?
Anyway, it could be described in terms of **JSON X-Types** as the following:

```json
[
  "string",
  "number",
  "boolean",
  null,
  {"string": "$ref:#/"},
  {"array": "$ref:#/"}
]
```
-->

## Literal Schemas

If there's something that cannot be expressed in terms of **JSON X-Type**, it should go under this key:

```json
{
  "$schema": {
    "type": "string",
    "contentMediaType": "application/jwt",
    "contentSchema": {"type": "array"}
  }
}
```

## Types Extending

Possible extensions described [here](./extensions.md)
