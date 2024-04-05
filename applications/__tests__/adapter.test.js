import {describe, expect, test} from "vitest"
import {translateXTypeToSchema} from "../x-types-adapter"

describe("adapter", () => {
  test("translates primitive strings", () => {
    expect(translateXTypeToSchema("string")).toEqual({type: "string"})
  })

  test("translates literals", () => {
    expect(
      translateXTypeToSchema({"$literal:string": "$literal:boolean"})
    ).toEqual({
      type: "object",
      properties: {string: {type: "string", const: "boolean"}},
      additionalProperties: false,
      required: ["string"],
    })
  })
})
