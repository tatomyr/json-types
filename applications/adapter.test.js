import {expect, test} from "vitest"
import {execSync} from "child_process"

test("translate x-type to schema", () => {
  const out = execSync(
    "redocly bundle applications/resources/openapi.yaml --force --config=applications/x-redocly.yaml"
  ).toString()
  expect(out).toMatchSnapshot()
})
