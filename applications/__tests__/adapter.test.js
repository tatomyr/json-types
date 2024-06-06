import {describe, expect, test} from "vitest"
import {resolveAndMerge, translateXTypeToSchema} from "../x-types-adapter"

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

  test("translates a correct $and into an object", () => {
    const merged = resolveAndMerge({
      $and: [{foo: "string"}, {bar: "number"}],
    })
    expect(merged).toEqual({foo: "string", bar: "number"})
    expect(translateXTypeToSchema(merged)).toEqual({
      type: "object",
      properties: {foo: {type: "string"}, bar: {type: "number"}},
      additionalProperties: false,
      required: ["foo", "bar"],
    })
  })

  test("translates an incorrect $and into `never`", () => {
    const merged = resolveAndMerge({
      $and: ["string", "number"],
    })
    expect(merged).toEqual("undefined")
    expect(translateXTypeToSchema(merged)).toEqual({not: {}})
  })
})
