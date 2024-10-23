import {describe, expect, test} from 'vitest'
import {runCommand} from './e2e-utils'

describe('bundle', () => {
  test('bundle and translate x-type to schema (for regular $ref objects)', () => {
    const {stdout} = runCommand(
      'redocly bundle applications/resources/openapi.yaml --config=applications/x-redocly.yaml'
    )
    expect(stdout).toMatchSnapshot()
  })

  test('do not add schemas if there is no x-type', () => {
    const {stdout} = runCommand(
      'redocly bundle applications/resources/openapi-without-x-types.yaml --config=applications/x-redocly.yaml'
    )
    expect(stdout).toMatchSnapshot()
  })

  test('resolve different type of $refs on different levels and ignore wrong $refs (with --force) when bundling', () => {
    const {stdout} = runCommand(
      'redocly bundle applications/resources/openapi-with-refs.yaml --force --config=applications/x-inline-refs-config-redocly.yaml'
    )
    expect(stdout).toMatchSnapshot()
  })

  test('do not bundle an openapi with type never', () => {
    const {stderr} = runCommand(
      'redocly bundle applications/resources/openapi-never.yaml --config=applications/x-redocly.yaml'
    )
    expect(stderr).toMatchSnapshot()
  })

  test('resolve and translate $ands', () => {
    const {stdout} = runCommand(
      'redocly bundle applications/resources/openapi-and.yaml --config=applications/x-redocly.yaml'
    )
    expect(stdout).toMatchSnapshot()
  })

  test('translate x-type to schema inside parameters', () => {
    const {stdout} = runCommand(
      'redocly bundle applications/resources/openapi-with-x-types-inside-parameters.yaml --config=applications/x-redocly.yaml'
    )
    expect(stdout).toMatchSnapshot()
  })

  test('translate x-types inside ORs', () => {
    const {stdout} = runCommand(
      'redocly bundle applications/resources/openapi-or.yaml --config=applications/x-redocly.yaml'
    )
    expect(stdout).toMatchSnapshot()
  })

  test('translate string and number formats', () => {
    const {stdout} = runCommand(
      'redocly bundle applications/resources/openapi-type-formats.yaml --config=applications/x-redocly.yaml'
    )
    expect(stdout).toMatchSnapshot()
  })

  test('distributivity in x-types', () => {
    const {stdout} = runCommand(
      'redocly bundle applications/resources/openapi-with-nested-ors-in-ands.yaml --config=applications/x-redocly.yaml'
    )
    expect(stdout).toMatchSnapshot()
  })

  test('replace existing schemas', () => {
    const {stdout: notPreserved} = runCommand(
      'redocly bundle applications/resources/openapi-with-schema.yaml --config=applications/x-redocly.yaml'
    )
    expect(notPreserved).toMatchSnapshot()
  })

  test('descriptions in x-types', () => {
    const {stdout} = runCommand(
      'redocly bundle applications/resources/openapi-with-descriptions.yaml --config=applications/x-redocly.yaml'
    )
    expect(stdout).toMatchSnapshot()
  })

  test('generate x-types from JSON Schemas and generate schemas back', () => {
    const {stdout: toXTypes} = runCommand(
      'redocly bundle applications/resources/pets.yaml --config=applications/generate-x-types-redocly.yaml'
    )
    expect(toXTypes).toMatchFileSnapshot('file-snapshots/pets-to-x-types.yaml')
    const {stdout: backToSchemas} = runCommand(
      'redocly bundle applications/__tests__/file-snapshots/pets-to-x-types.yaml --config=applications/x-redocly.yaml'
    )
    expect(backToSchemas).toMatchFileSnapshot(
      'file-snapshots/pets-back-to-schemas.yaml'
    )
  })

  test('openapi writeOnly and readOnly fields', () => {
    const {stdout} = runCommand(
      'redocly bundle applications/resources/openapi-with-writeonly-and-readonly.yaml --config=applications/x-redocly.yaml'
    )
    expect(stdout).toMatchSnapshot()
  })
})
