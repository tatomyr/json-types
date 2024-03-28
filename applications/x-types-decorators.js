const {isObject, merge} = require("./x-types-utils")

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
    return true
  }

  if (xType === "undefined") {
    throw new Error("Should not get here")
  }

  if (typeof xType.array !== "undefined") {
    return {type: "array", items: translateXTypeToSchema(xType.array, ctx)}
  }

  if (typeof xType.$and !== "undefined") {
    return translateXTypeToSchema(merge(...xType.$and), ctx)
    // TODO: consider also this:
    // return {
    //   allOf: xType.$and.map((item) => {
    //     const translated = translateXTypeToSchema(item);
    //     if (isObject(translated) && translated.additionalProperties === undefined) {
    //       translated.additionalProperties = true;
    //     }
    //     return translated;
    //   }),
    // };
  }

  // Translate $ref prefixes ($ref:...) into $ref objects.
  if (typeof xType.$ref !== "undefined") {
    return translateXTypeToSchema(ctx.resolve(xType).node)
  }

  if (typeof xType === "string") {
    return {type: "string", const: xType}
  }

  if (xType instanceof Array) {
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
      properties[key] = translateXTypeToSchema(props[key], ctx)

      if (props[key] instanceof Array && props[key].includes("undefined")) {
        //  skip
      } else {
        required.push(key)
      }
    }

    return {type: "object", properties, required, additionalProperties}
  }

  if (typeof xType === "number" || typeof xType === "boolean") {
    throw new Error(`Cannot proscess type "${xType}"`)
  }

  throw new Error("Should be processed:", xType)
}

const generateSchema = () => {
  return {
    MediaType: {
      enter(mediaType, ctx) {
        if (typeof mediaType["x-type"] === "undefined") return
        if (typeof mediaType.schema !== "undefined") {
          console.log("SKIP")
          return
        }

        const schema = translateXTypeToSchema(mediaType["x-type"], ctx)
        mediaType.schema = schema
      },
    },
  }
}

const create$Refs = () => {
  return {
    any: {
      enter: (node, ctx) => {
        if (!isObject(node)) return

        for (const key in node) {
          const value = node[key]
          if (typeof value === "string" && value.startsWith("$ref:")) {
            const $ref = value.slice("$ref:".length)
            node[key] = {$ref}
          }
        }
      },
    },
  }
}

module.exports = {
  generateSchema,
  create$Refs,
}
