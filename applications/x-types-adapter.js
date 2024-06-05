const {isObject, mergeAll} = require("./x-types-utils")

const translateXTypeToSchema = (xType, ctx) => {
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
    return {type: "array", items: translateXTypeToSchema(xType.array, ctx)}
  }

  if (typeof xType.$and !== "undefined") {
    if (!Array.isArray(xType.$and)) {
      console.error()
      console.error("ERROR! Expected array but got:")
      console.error(xType.$and)
      console.error()
      return {}
    }
    return translateXTypeToSchema(mergeAll(...xType.$and), ctx)
    /* 
    // TODO: consider also this:
    return {
      allOf: xType.$and.map((item) => {
        const translated = translateXTypeToSchema(item);
        if (isObject(translated) && translated.additionalProperties === undefined) {
          translated.additionalProperties = true;
        }
        return translated;
      }),
    };
     */
  }

  if (typeof xType.$ref !== "undefined") {
    if (ctx.resolve(xType).node === undefined) {
      return translateXTypeToSchema("any")
    }

    return translateXTypeToSchema(ctx.resolve(xType).node, ctx)
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
    return {
      anyOf: xType
        .filter(type => type !== "undefined")
        .map(type => translateXTypeToSchema(type, ctx)),
    }
  }

  if (isObject(xType)) {
    let properties = {}
    let required = []
    const {string, ...props} = xType
    const additionalProperties =
      typeof string === "undefined"
        ? false
        : translateXTypeToSchema(string, ctx)

    for (const key in props) {
      const realKey = key.startsWith("$literal:")
        ? key.slice("$literal:".length)
        : key

      properties[realKey] = translateXTypeToSchema(props[key], ctx)

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
}
