const {isObject} = require("./x-types-utils")
const {translateXTypeToSchema} = require("./x-types-adapter")
const {resolveAndMerge} = require("./x-types-resolver")

const generateSchema = opts => {
  const preserveExistingSchemas = !!opts?.preserveExistingSchemas
  return {
    MediaType: {
      leave(mediaType, ctx) {
        const original = mediaType["x-type"]
        if (
          typeof original === "undefined" ||
          (preserveExistingSchemas && mediaType.schema)
        )
          return
        const resolvedXType = resolveAndMerge(original, ctx)
        const schema = translateXTypeToSchema(resolvedXType)
        mediaType.schema = schema
      },
    },
    Parameter: {
      leave(parameter, ctx) {
        const original = parameter["x-type"]
        if (
          typeof original === "undefined" ||
          (preserveExistingSchemas && parameter.schema)
        )
          return
        const resolvedXType = resolveAndMerge(original, ctx)
        const schema = translateXTypeToSchema(resolvedXType)
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
