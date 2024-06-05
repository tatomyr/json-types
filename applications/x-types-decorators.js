const {isObject} = require("./x-types-utils")
const {translateXTypeToSchema} = require("./x-types-adapter")

const generateSchema = () => {
  return {
    MediaType: {
      leave(mediaType, ctx) {
        if (typeof mediaType["x-type"] === "undefined") return
        const schema = translateXTypeToSchema(mediaType["x-type"], ctx)
        mediaType.schema = schema
      },
    },
    Parameter: {
      leave(parameter, ctx) {
        if (typeof parameter["x-type"] === "undefined") return
        const schema = translateXTypeToSchema(parameter["x-type"], ctx)
        parameter.schema = schema
      },
    },
  }
}

const createRefs = () => {
  return {
    any: {
      enter: (node, ctx) => {
        if (isObject(node) || Array.isArray(node)) {
          for (const key in node) {
            const value = node[key]
            if (typeof value === "string" && value.startsWith("$ref:")) {
              const $ref = value.slice("$ref:".length)
              node[key] = {$ref}
            }
          }
        }
      },
    },
  }
}

module.exports = {
  generateSchema,
  createRefs,
}
