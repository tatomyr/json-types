import {describe, expect, test} from "vitest"
import {execSync} from "child_process"

describe("bundle", () => {
  test("bundle and translate x-type to schema", () => {
    const out = execSync(
      "redocly bundle applications/resources/openapi.yaml --force --config=applications/x-redocly.yaml"
    ).toString()
    expect(out).toMatchSnapshot()
  })

  test('do not translate if there is no x-type', ()=>{
    const out = execSync(
      "redocly bundle applications/resources/openapi-without-x-types.yaml --force --config=applications/x-redocly.yaml"
    ).toString()
    expect(out).toMatchSnapshot()
  })

  test('ignore wrong ref when bundling', ()=>{
    const out = execSync(
      "redocly bundle applications/resources/openapi-with-a-wrong-ref.yaml --force --config=applications/x-redocly.yaml"
    ).toString()
    expect(out).toMatchSnapshot()
  })

  // test('transforms $refs', ()=>{  }) // ...on different levels
})

// describe("lint", () => { })
