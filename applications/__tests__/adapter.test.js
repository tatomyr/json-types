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
      properties: {string: {type: "string", enum: ["boolean"]}},
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

  test("handles OR", () => {
    expect(translateXTypeToSchema(["string", "number"])).toEqual({
      anyOf: [{type: "string"}, {type: "number"}],
    })
    expect(translateXTypeToSchema(["foo", "bar"])).toEqual({
      type: "string",
      enum: ["foo", "bar"],
    })
    expect(translateXTypeToSchema(["string", "undefined"])).toEqual({
      type: "string",
    })
    expect(translateXTypeToSchema(["undefined"])).toEqual({
      not: {},
    })
    expect(
      translateXTypeToSchema({
        Required: ["foo", "number"],
        Conditional: ["string", "undefined"],
      })
    ).toEqual({
      type: "object",
      properties: {
        Required: {
          anyOf: [{type: "string", enum: ["foo"]}, {type: "number"}],
        },
        Conditional: {type: "string"},
      },
      additionalProperties: false,
      required: ["Required"],
    })
  })
})
