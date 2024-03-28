const noArrayNeighbors = () => {
  return {
    XTypeObject: {
      enter(node, ctx) {
        const {array, ...rest} = node
        if (typeof array !== "undefined" && Object.keys(rest).length > 0) {
          ctx.report({
            message: `You cannot have other properties alongside "array" in the same object`,
            location: ctx.location,
          })
        }
      },
    },
  }
}

const no$andNeighbors = () => {
  return {
    XTypeObject: {
      enter(node, ctx) {
        const {$and, ...rest} = node
        if (typeof $and !== "undefined" && Object.keys(rest).length > 0) {
          ctx.report({
            message: `You cannot have other properties alongside "$and" in the same object`,
            location: ctx.location,
          })
        }
      },
    },
  }
}

const no$refNeighbors = () => {
  return {
    ref: {
      enter(node, ctx) {
        const {$ref, ...rest} = node
        if (typeof $ref !== "undefined" && Object.keys(rest).length > 0) {
          ctx.report({
            message: `You cannot have other properties alongside "$ref" in the same object`,
            location: ctx.location,
          })
        }
      },
    },
  }
}

module.exports = {
  noArrayNeighbors,
  no$andNeighbors,
  no$refNeighbors,
}
