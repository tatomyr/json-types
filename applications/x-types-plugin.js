const {generateSchema, create$Refs} = require("./x-types-decorators")
const {
  noArrayNeighbors,
  no$andNeighbors,
  no$refNeighbors,
} = require("./x-types-rules")

const getType = value => {
  try {
    if (typeof value === "string") {
      return {type: "string"}
    }

    if (value instanceof Array) {
      return {name: "XTypeList", properties: {}, items: getType}
    }

    if (typeof value === "object" && value !== null) {
      return "XTypeObject"
    }
  } catch (err) {
    console.error(err)
  }
}

const XTypeObject = {
  properties: {
    array: getType,
    string: getType,
    $and: {
      name: "XTypeList",
      properties: {},
      items: getType, // 'XTypeObject'
    },
  },
  additionalProperties: getType,
}

module.exports = {
  id: "x-types",

  preprocessors: {
    oas3: {
      "create-$refs": create$Refs,
    },
  },

  decorators: {
    oas3: {
      "generate-schemas": generateSchema,
    },
  },

  rules: {
    oas3: {
      "no-array-neighbors": noArrayNeighbors,
      "no-$and-neighbors": no$andNeighbors,
      "no-$ref-neighbors": no$refNeighbors,
    },
  },

  configs: {
    all: {
      rules: {
        "x-types/no-array-neighbors": "error",
        "x-types/no-$and-neighbors": "error",
        "x-types/no-$ref-neighbors": "error",
      },
    },
  },

  typeExtension: {
    oas3(types) {
      return {
        ...types,
        XTypeObject: XTypeObject,
        MediaType: {
          ...types.MediaType,
          properties: {
            ...types.MediaType.properties,
            "x-type": getType,
          },
        },
      }
    },
  },
}
