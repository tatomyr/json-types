const {isObject, mergeAll} = require("./x-types-utils")

const resolveAndMerge = (xType, ctx) => {
  if (typeof xType.$ref !== "undefined") {
    const resolved = ctx.resolve(xType).node
    if (resolved === undefined) {
      console.error()
      console.error("ERROR! Cannot resolve $ref:")
      console.error(xType.$ref)
      console.error()
      return "any"
    }
    return resolveAndMerge(resolved, ctx)
  }

  if (typeof xType.$and !== "undefined") {
    if (!Array.isArray(xType.$and)) {
      console.error()
      console.error("ERROR! Expected array but got:")
      console.error(xType.$and)
      console.error()
      return "any"
    }
    return mergeAll(...resolveAndMerge(xType.$and, ctx))
  }

  if (Array.isArray(xType)) {
    return xType.map(type => resolveAndMerge(type, ctx))
  }

  if (isObject(xType)) {
    let obj = {}
    for (const key in xType) {
      obj[key] = resolveAndMerge(xType[key], ctx)
    }
    return obj
  }

  return xType
}

const translateXTypeToSchema = xType => {
  if (typeof xType === "undefined") {
    throw new Error('Expected "x-type" but got "undefined"')
  }

  if (xType === null) {
    return {type: "null"}
  }

  if (xType === "string") {
    return {type: "string"}
  }

  if (xType === "number") {
    return {type: "number"}
  }

  if (xType === "number::integer") {
    return {type: "integer"}
  }

  if (xType === "boolean") {
    return {type: "boolean"}
  }

  if (xType === "any") {
    return {
      anyOf: [
        {type: "string"},
        {type: "number"},
        {type: "boolean"},
        {type: "object"},
        {type: "array"},
        {type: "null"},
      ],
    }
  }

  if (xType === "undefined") {
    console.warn()
    console.warn("WARNING! Got an 'undefined' type")
    console.warn()
    return {not: {}}
  }

  if (typeof xType.array !== "undefined") {
    return {type: "array", items: translateXTypeToSchema(xType.array)}
  }

  if (typeof xType === "string" && xType.startsWith("$literal:")) {
    return {type: "string", const: xType.slice("$literal:".length)}
  }

  if (
    (typeof xType === "string") |
    (typeof xType === "number") |
    (typeof xType === "boolean")
  ) {
    return {type: typeof xType, const: xType}
  }

  if (Array.isArray(xType)) {
    const normalized = xType
      .filter(type => type !== "undefined")
      .map(type => translateXTypeToSchema(type))
    if (normalized.length === 0) {
      return {not: {}}
    }
    if (normalized.length === 1) {
      return normalized[0]
    }
    if (
      normalized.every(
        schema => schema.type === "string" && typeof schema.const === "string"
      )
    ) {
      return {type: "string", enum: normalized.map(schema => schema.const)}
    }
    return {
      anyOf: normalized,
    }
  }

  if (isObject(xType)) {
    let properties = {}
    let required = []
    const {string, ...props} = xType
    const additionalProperties =
      typeof string === "undefined" ? false : translateXTypeToSchema(string)

    for (const key in props) {
      const realKey = key.startsWith("$literal:")
        ? key.slice("$literal:".length)
        : key

      properties[realKey] = translateXTypeToSchema(props[key])

      if (props[key] instanceof Array && props[key].includes("undefined")) {
        // skip
      } else {
        required.push(realKey)
      }
    }

    return {type: "object", properties, required, additionalProperties}
  }

  throw new Error("Cannot process x-type:", xType)
}

module.exports = {
  translateXTypeToSchema,
  resolveAndMerge,
}
