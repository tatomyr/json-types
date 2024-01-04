# Type Extending

> Under consideration.

It is possible to add some additional context to types and values using modifiers.

## Prefixes

> Could be helpful for describing OpenAPI-compatible types.

To make a field only appear in responses, use the `$read-only` prefix.
The similar prefix for requests is `$write-only`:

```json
{
  "name": "string",
  "$write-only:password": "string",
  "$read-only:id": "string"
}
```

Those prefixes can be used only with keys.

## Suffixes

Suffixes are intended to specify different formats of the basic types.
They are denoted by the double colon notation.

### String Formats

String formats can include, among others, `uuid`, `date-time`, `uri`, `email`.
The list of possible string formats should correspond to the one described in [JSONSchema string formats](https://json-schema.org/understanding-json-schema/reference/string.html#format).

String formats could be used both in keys and values:

```json
{
  "id": "string::uuid",
  "string::email": {"validated": "boolean"}
}
```

### Number Formats

Number formats are: `integer`, `minimum`, `maximum`, `exclusive-minimum`, `exclusive-maximum`.
Formats could be sequentially chained.
The range formats require a number value in parenthesis:

```json
{
  "age": "number::integer::minimum(18)"
}
```

## Free Form Validation

If a field needs to be validated against its context, the validation function could be used:

```json
{
  "country": ["UA", "USA"],
  "age": "(age, {country}) => (country === 'USA' && age < 21 || country === 'UA' && age < 18) && 'Too young to drink'"
}
```

A validation function is a JavaScript function that accepts the value itself and its parents up to the root of the object and returns either a string with an error message or any falsy value if the field is valid.

## Discriminator

TBD
