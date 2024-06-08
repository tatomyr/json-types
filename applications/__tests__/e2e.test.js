import {describe, expect, test} from "vitest"
import {execSync, spawnSync} from "child_process"

const runCommand = cmd => {
  let stderr, stdout
  try {
    const out = execSync(cmd, {
      env: {
        ...process.env,
        NODE_ENV: "test",
        NO_COLOR: "TRUE",
      },
    })
    stdout = out.toString("utf-8")
  } catch (err) {
    stderr = err.stderr.toString("utf-8")
  }
  return {stderr, stdout}
}

const stripCWD = str => str.replace(process.cwd(), ".")

describe("bundle", () => {
  test("bundle and translate x-type to schema (for regular $ref objects)", () => {
    const {stdout} = runCommand(
      "redocly bundle applications/resources/openapi.yaml --config=applications/x-redocly.yaml"
    )
    expect(stdout).toMatchSnapshot()
  })

  test("do not add schemas if there is no x-type", () => {
    const {stdout} = runCommand(
      "redocly bundle applications/resources/openapi-without-x-types.yaml --config=applications/x-redocly.yaml"
    )
    expect(stdout).toMatchSnapshot()
  })

  test("resolve different type of $refs on different levels and ignore wrong $refs (with --force) when bundling", () => {
    const {stdout} = runCommand(
      "redocly bundle applications/resources/openapi-with-refs.yaml --force --config=applications/x-inline-refs-config-redocly.yaml"
    )
    expect(stdout).toMatchSnapshot()
  })

  test("do not bundle an openapi with type never", () => {
    const {stderr} = runCommand(
      "redocly bundle applications/resources/openapi-never.yaml --config=applications/x-redocly.yaml"
    )
    expect(stderr).toMatchSnapshot()
  })

  test("bundle and translate x-type to schema inside parameters", () => {
    const {stdout} = runCommand(
      "redocly bundle applications/resources/openapi-with-x-types-inside-parameters.yaml --config=applications/x-redocly.yaml"
    )
    expect(stdout).toMatchSnapshot()
  })

  test("bundle and translate x-types inside ORs", () => {
    const {stdout} = runCommand(
      "redocly bundle applications/resources/openapi-or.yaml --config=applications/x-redocly.yaml"
    )
    expect(stdout).toMatchSnapshot()
  })

  test("translate string and number formats", () => {
    const {stdout} = runCommand(
      "redocly bundle applications/resources/openapi-type-formats.yaml --config=applications/x-redocly.yaml"
    )
    expect(stdout).toMatchSnapshot()
  })
})

describe("lint", () => {
  test("lints openapi.yaml (using preprocessors to transform)", () => {
    const {stderr} = runCommand(
      "redocly lint applications/resources/openapi.yaml --config=applications/x-redocly.yaml"
    )
    expect(stderr).toMatchSnapshot()
  })

  test("lints x-openapi-with-refs.yaml", () => {
    const {stdout} = runCommand(
      "redocly bundle applications/resources/openapi-with-refs.yaml -o=applications/outputs/x-openapi-with-refs.yaml --force --config=applications/x-inline-refs-config-redocly.yaml"
    )
    const {stderr} = runCommand(
      "redocly lint applications/outputs/x-openapi-with-refs.yaml --config=applications/x-inline-refs-config-redocly.yaml"
    )
    expect(stripCWD(stderr)).toMatchSnapshot()
  })

  test("lints openapi with mixed types", () => {
    const {stderr} = runCommand(
      "redocly lint applications/resources/openapi-mixed-types.yaml  --config=applications/x-redocly.yaml"
    )
    expect(stripCWD(stderr)).toMatchSnapshot()
  })

  test("lints openapi that contains wrong and correct $ands", () => {
    const {stderr} = runCommand(
      "redocly lint applications/resources/openapi-and.yaml  --config=applications/x-redocly.yaml"
    )
    expect(stripCWD(stderr)).toMatchSnapshot()
  })

  test("lints with x-types inside parameters", () => {
    const {stderr} = runCommand(
      "redocly lint applications/resources/openapi-with-x-types-inside-parameters.yaml --config=applications/x-redocly.yaml"
    )
    expect(stderr).toMatchSnapshot()
  })

  test("lints ORs (including nested and referenced)", () => {
    const {stderr} = runCommand(
      "redocly lint applications/resources/openapi-or.yaml --config=applications/x-redocly.yaml"
    )
    expect(stderr).toMatchSnapshot()
  })
})
