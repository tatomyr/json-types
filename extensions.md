# Types Extending

It is possible to add additional context to types and values using other reserved keys and suffixes.

## Reserved Keywords

| Keyword                                           | Description                                                                                                                                                                        | Usage |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| $descriptions [🔗](#descriptions)                 | An object containing descriptions of the fields at the same level.                                                                                                                 | key   |
| $writeonly [🔗](#read-only-and-write-only-fields) | Describes a write-only field.                                                                                                                                                      | key   |
| $readonly [🔗](#read-only-and-write-only-fields)  | Describes a read-only field.                                                                                                                                                       | key   |
| $discriminator [🔗](#discriminator)               | Represents a discriminator ([🔗](https://spec.openapis.org/oas/latest.html#discriminator-object)). It should contain the `propertyName` field, and optionally the `mapping` field. | key   |
| $xor                                              | Refers to the discriminator options. It only makes sense in conjunction with `$discriminator`.                                                                                     | key   |

Those keywords can be helpful for describing OpenAPI-compatible types.

### Descriptions

Descriptions provide additional information about the fields.
They can only be used in objects:

```json
{
  "name": "string",
  "$descriptions": {
    "name": "The name of the user."
  }
}
```

Descriptions are propagated to the OpenAPI schema as the `description` fields of the corresponding properties.

### Read-only and Write-only fields

The `$writeonly` and `$readonly` fields contain properties that should be present only in requests or responses respectively.
Consider this example:

```json
{
  "name": "string",
  "password": {"$writeonly": "string"},
  "id": {"$readonly": "string"},
  "createdAt": {"$readonly": "string::date-time"}
}
```

The `password` field is only expected in requests, while `id` and `createdAt` are expected in responses.
The `name` field is expected in both requests and responses.

### Discriminator

TBD

<!-- Either introduce $xor + $discriminator or use $schema -->

## Suffixes

Suffixes are intended to specify different formats or other properties of the basic types.
They are denoted by the double colon notation.
There should be no more than one format specified.
Suffixes can be sequentially chained.

### String Formats and Modifiers

String formats include, among others, `date-time`, `email`, `uuid`, `uri`.
The list of possible string formats should correspond to the one described in [JSON Schema string formats](https://json-schema.org/understanding-json-schema/reference/string.html#format).

Example:

```json
{
  "id": "string::uuid",
  "string::pattern(^[a-z]+$)": "string::min(1)"
}
```

The modifiers are `min`, `max` (for minimal and maximal length respectively), and `pattern`.
The corresponding values are passed in parentheses:

```json
{
  "name": "string::min(3)::max(30)::pattern([A-Za-z]+)"
}
```

The `pattern` modifier cannot be used in conjunction with anything else.
Using suffixes in keys is restricted to the `pattern` modifier only.

### Number Formats and Modifiers

The only supported number format is `integer`, and the modifiers are: `min`, `max`, `x-min` (for exclusive minimum), `x-max` (for exclusive maximum).
The range modifiers require a number value in parenthesis:

```json
{
  "age": "number::integer::min(18)"
}
```

<!-- TODO: consider this syntax:
{"array::min(1)": "any"}
Alternatively:
{"array": "any", "minItems": 1}
-->

## Free Form Validation

> Under consideration.

If a field needs to be validated against its context, the validation function can be used:

```json
{
  "country": ["🇺🇦", "🇺🇸"],
  "age": "(age, {country}) => (country === '🇺🇸' && age < 21 || country === '🇺🇦' && age < 18) && 'Too young for 🍺'"
}
```

A validation function is a JavaScript function that accepts the value itself and its parents up to the root of the object and returns either a string with an error message or a falsy value if the field is valid.
