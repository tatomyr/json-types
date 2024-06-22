# Type Extending

> Under consideration.

It is possible to add some additional context to types and values using modifiers.

## Prefixes

> Could be helpful for describing OpenAPI-compatible types.

To make a field only appear in responses, use the `$readonly` prefix.
The similar prefix for requests is `$writeonly`:

```json
{
  "name": "string",
  "$writeonly:password": "string",
  "$readonly:id": "string"
}
```

Those prefixes can be used only with keys.

## Suffixes

Suffixes are intended to specify different formats of the basic types.
They are denoted by the double colon notation.

### String Formats and Modifiers

String formats can include, among others, `date-time`, `email`, `uuid`, `uri`.
The list of possible string formats should correspond to the one described in [JSONSchema string formats](https://json-schema.org/understanding-json-schema/reference/string.html#format).

String formats could be used both in keys and values:

```json
{
  "id": "string::uuid",
  "string::email": {"validated": "boolean"}
}
```

The modifiers are `min`, `max` (for minimal and maximum length respectively), and `pattern`.
The corresponding values are passed in parentheses:

```json
{
  "name": "string::min(3)::max(30)::pattern([A-Za-z]+)"
}
```

### Number Formats and Modifiers

The only supported number format is `integer`, and the modifiers are: `min`, `max`, `x-min` (for exclusive minimum), `x-max` (for exclusive maximum).
They could be sequentially chained (if the format exists it should go before the modifiers).
The range modifiers require a number value in parenthesis:

```json
{
  "age": "number::integer::min(18)"
}
```

## Free Form Validation

> Under consideration.

If a field needs to be validated against its context, the validation function could be used:

```json
{
  "country": ["🇺🇦", "🇺🇸"],
  "age": "(age, {country}) => (country === '🇺🇸' && age < 21 || country === '🇺🇦' && age < 18) && 'Too young for 🍺'"
}
```

A validation function is a JavaScript function that accepts the value itself and its parents up to the root of the object and returns either a string with an error message or a falsy value if the field is valid.

## Discriminator

TBD

<!-- Either introduce $xor + $discriminator or use $schema -->
