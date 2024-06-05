const noRefNeighbors = () => {
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
  noRefNeighbors,
}
