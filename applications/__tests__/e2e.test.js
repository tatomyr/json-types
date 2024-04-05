import {describe, expect, test} from "vitest"
import {execSync} from "child_process"

describe("bundle", () => {
  test("bundle and translate x-type to schema", () => {
    const out = execSync(
      "redocly bundle applications/resources/openapi.yaml --config=applications/x-inline-refs-config-redocly.yaml"
    ).toString()
    expect(out).toMatchFileSnapshot('../outputs/x-openapi.yaml')
  })

  test("do not add schemas if there is no x-type", () => {
    const out = execSync(
      "redocly bundle applications/resources/openapi-without-x-types.yaml --config=applications/x-inline-refs-config-redocly.yaml"
    ).toString()
    expect(out).toMatchSnapshot()
  })

  test("resolve refs on different levels and ignore wrong refs (with --force) when bundling", () => {
    const out = execSync(
      "redocly bundle applications/resources/openapi-with-refs.yaml --force --config=applications/x-inline-refs-config-redocly.yaml"
    ).toString()
    expect(out).toMatchFileSnapshot("../outputs/x-openapi-with-refs.yaml")
  })
})

describe("lint", () => {
  test("lints x-openapi.yaml", () => {
    let error = ""
    try {
      execSync(
        "redocly lint applications/outputs/x-openapi.yaml --config=applications/x-inline-refs-config-redocly.yaml"
      ).toString()
    } catch (err) {
      error = err.stderr.toString()
    }
    expect(error).toMatchSnapshot()
  })

  test("lints x-openapi-with-refs.yaml", () => {
    let error = ""
    try {
      execSync(
        "redocly lint applications/outputs/x-openapi-with-refs.yaml --config=applications/x-inline-refs-config-redocly.yaml"
      ).toString()
    } catch (err) {
      error = err.stderr.toString()
    }
    expect(error).toMatchSnapshot()
  })
})
