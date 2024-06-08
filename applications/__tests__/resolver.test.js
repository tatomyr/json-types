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

  test("handle nested ORs", () => {
    expect(resolveAndMerge([["az", "bukh"], ["vidh"]])).toEqual([
      "az",
      "bukh",
      "vidh",
    ])
  })

  // FIXME:
  test.skip("nested ORs in $and", () => {
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
