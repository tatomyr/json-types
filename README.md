# JSON X-Type

**JSON X-Type** is a data type format for describing JSON-like structures in a simple and natural way.
Any [valid JSON](https://www.json.org/) can be validated against a **JSON X-Type** definition.

## Reserved Keywords

| Keyword                          | Description                                                         | Usage      |
| -------------------------------- | ------------------------------------------------------------------- | ---------- |
| string                           | String type.                                                        | key, value |
| number                           | Number type.                                                        | value      |
| boolean                          | Boolean type.                                                       | value      |
| `null`                           | The `null` value. (Note: The string "null" has no special meaning.) | value      |
| undefined                        | Indicates that the value is not set.                                | value      |
| array                            | Array generic.                                                      | key        |
| any                              | Any value (not validated).                                          | value      |
| $and ([🔗](#types-combining))    | Represents the combination of array members.                        | key        |
| $ref ([🔗](#references))         | Reference to another **JSON X-Type**.                               | key        |
| $schema ([🔗](#literal-schemas)) | A literal JSON Schema definition.                                   | key        |

The list can be extended with other `$`-prefixed keywords.
So it's a good idea to escape any custom keys that start with `$` using the `$literal` prefix ([🔗](#literals-escaping)).

## Objects

Object literals define object-like schemas:

```json
{
  "name": "string",
  "age": "number"
}
```

The example above defines an object with two required properties.

It's also possible to use the `string` type as a key to describe records:

```json
{
  "string": "boolean"
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

Array literals define multiple options, one of which is applicable:

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

The result is an object that includes all of the properties of all the items:

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

Effectively, it applies the `AND` relation between the array members, replacing the `OR` relation.

Note that it doesn't make sense to combine primitive types or objects that have common properties with different types:

```json
{
  "$and": [{"foo": "string"}, {"foo": "number"}]
}
```

The above example results in `foo` being both `string` and `number`, which is effectively equivalent to TypeScript's `never` type.

The `$schema` property also cannot be combined using the `$and` notation ([🔗](#literal-schemas)).

Impossible combinations should result in the `undefined` type.

## Literals Escaping

Whenever there is a need to use a literal string value instead of a reserved keyword, it must be prepended with the `$literal:` prefix:

```json
{
  "$literal:string": "boolean"
}
```

This checks for an object with the `string` key of a `boolean` value, e.g.:

```json
{
  "string": true
}
```

## References

It is possible to refer to other **JSON X-Types** using the [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901) syntax:

```json
{
  "foo": {"$ref": "#/bar"},
  "bar": "["string", "number", "boolean"]"
}
```

A reference must be resolved relative to the file it appears in.
The `$ref` expression must be replaced with the value of the field it refers to.
Any other properties alongside the `$ref` must be ignored.

Alternatively, the `$ref` keyword can be used as a prefix which is easier to write and read (but the support is up to the implementation):

```json
{
  "foo": "$ref:./path/to/file"
}
```

<!-- Q: Could it be used as a key? Does that even make sense? -->

If a reference cannot be resolved, it should be treated as `any`.

## Literal Schemas

If something cannot be expressed in terms of **JSON X-Type**, it should go under this key:

```json
{
  "$schema": {
    "type": "string",
    "contentMediaType": "application/jwt",
    "contentSchema": {"type": "array"}
  }
}
```

Note that it's not possible to use **JSON X-Types** inside `$schema`.
Additionally, `$schema` cannot be used inside `$and` operators ([🔗](#types-combining)).

## Types Extending

Possible extensions are described [here](./extensions.md).
