const {generateSchema, createRefs} = require("./x-types-decorators")
const {noRefNeighbors} = require("./x-types-rules")

const getType = value => {
  try {
    if (typeof value === "string") {
      return {type: "string"}
    }

    if (typeof value === "number") {
      return {type: "number"}
    }

    if (typeof value === "boolean") {
      return {type: "boolean"}
    }

    if (value instanceof Array) {
      return {name: "XTypeList", properties: {}, items: getType}
    }

    if (typeof value === "object" && value !== null) {
      if (typeof value.array !== "undefined") {
        return "XTypeArray"
      }

      if (typeof value.$and !== "undefined") {
        return "XTypeAND"
      }

      if (typeof value.$ref !== "undefined") {
        return {
          properties: {$ref: getType},
        }
      }

      return "XTypeObject"
    }
  } catch (err) {
    console.error(err)
  }
}

const XTypeArray = {
  properties: {
    array: getType,
  },
}

const XTypeObject_Record = {
  properties: {
    string: getType,
  },
}

const XTypeAND = {
  properties: {
    $and: {
      name: "XTypeList",
      properties: {},
      items: getType,
    },
  },
}

const XTypeObject = {
  properties: {
    string: getType,
  },
  additionalProperties: getType,
}

module.exports = {
  id: "x-types",

  preprocessors: {
    oas3: {
      "create-$refs": createRefs,
    },
  },

  decorators: {
    oas3: {
      "generate-schemas": generateSchema,
    },
  },

  rules: {
    oas3: {
      "no-$ref-neighbors": noRefNeighbors,
    },
  },

  configs: {
    all: {
      rules: {
        "x-types/no-$ref-neighbors": "error",
      },
    },
  },

  typeExtension: {
    oas3(types) {
      return {
        ...types,
        XTypeArray,
        XTypeObject_Record,
        XTypeAND,
        XTypeObject,
        MediaType: {
          ...types.MediaType,
          properties: {
            ...types.MediaType.properties,
            "x-type": getType,
          },
        },
        Parameter: {
          ...types.Parameter,
          properties: {
            ...types.Parameter.properties,
            "x-type": getType,
          },
          requiredOneOf: ["schema", "content", "x-type"],
        },
        Components: {
          ...types.Components,
          properties: {
            ...types.Components.properties,
            "x-types": {
              name: "NamedXTypes",
              properties: {},
              additionalProperties: getType,
            },
          },
        },
        // TODO: Add more types here
      }
    },
  },
}
