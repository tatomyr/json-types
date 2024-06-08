import {describe, expect, test} from "vitest"
const {resolveAndMerge} = require("../x-types-resolver")

describe("resolver", () => {
  test("transform a correct $and into an object", () => {
    const merged = resolveAndMerge({
      $and: [{az: "string"}, {bukh: "number"}],
    })
    expect(merged).toEqual({az: "string", bukh: "number"})
  })

  test("transform an incorrect $and into `never`", () => {
    expect(
      resolveAndMerge({
        $and: ["string", "number"],
      })
    ).toEqual("undefined")
    expect(resolveAndMerge({$and: []})).toEqual("undefined")
    expect(
      resolveAndMerge({$and: [{az: "string"}, {array: "string"}]})
    ).toEqual("undefined")
    expect(resolveAndMerge({$and: {}})).toEqual("undefined")
    expect(resolveAndMerge({$and: [42, true]})).toEqual("undefined")
  })

  test("neutrality in $and", () => {
    expect(resolveAndMerge({$and: ["az", "any"]})).toEqual("az")
  })

  test("associativity in ORs", () => {
    expect(resolveAndMerge(["az", ["bukh", "vidh"]])).toEqual([
      "az",
      "bukh",
      "vidh",
    ])
    expect(resolveAndMerge([["az", "bukh"], ["vidh"]])).toEqual([
      "az",
      "bukh",
      "vidh",
    ])
  })

  test("associativity in $and", () => {
    expect(
      resolveAndMerge({
        $and: [{$and: [{az: "string"}, {bukh: "string"}]}, {vidh: "string"}],
      })
    ).toEqual({az: "string", bukh: "string", vidh: "string"})
  })

  test("distributivity in nested ORs in $and", () => {
    expect(
      resolveAndMerge({
        $and: [[{az: "string"}, {bukh: "string"}], [{vidh: "string"}]],
      })
    ).toEqual([
      {az: "string", vidh: "string"},
      {bukh: "string", vidh: "string"},
    ])
  })
})
