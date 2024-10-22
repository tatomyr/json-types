import {describe, expect, test} from 'vitest'
import {runCommand, stripCWD} from './e2e-utils'

describe('lint', () => {
  test('general openapi case (using preprocessors to transform)', () => {
    const {stderr} = runCommand(
      'redocly lint applications/resources/openapi.yaml --config=applications/x-redocly.yaml'
    )
    expect(stderr).toMatchSnapshot()
  })

  test('inline refs in x-openapi-with-refs.yaml', () => {
    const {stdout} = runCommand(
      'redocly bundle applications/resources/openapi-with-refs.yaml -o=applications/outputs/x-openapi-with-refs.yaml --force --config=applications/x-inline-refs-config-redocly.yaml'
    )
    const {stderr} = runCommand(
      'redocly lint applications/outputs/x-openapi-with-refs.yaml --config=applications/x-inline-refs-config-redocly.yaml'
    )
    expect(stripCWD(stderr)).toMatchSnapshot()
  })

  test('openapi with mixed types', () => {
    const {stderr} = runCommand(
      'redocly lint applications/resources/openapi-mixed-types.yaml  --config=applications/x-redocly.yaml'
    )
    expect(stripCWD(stderr)).toMatchSnapshot()
  })

  test('openapi that contains wrong and correct $ands', () => {
    const {stderr} = runCommand(
      'redocly lint applications/resources/openapi-and.yaml  --config=applications/x-redocly.yaml'
    )
    expect(stripCWD(stderr)).toMatchSnapshot()
  })

  test('openapi with x-types inside parameters', () => {
    const {stderr} = runCommand(
      'redocly lint applications/resources/openapi-with-x-types-inside-parameters.yaml --config=applications/x-redocly.yaml'
    )
    expect(stderr).toMatchSnapshot()
  })

  test('openapi with ORs (including nested and referenced)', () => {
    const {stderr} = runCommand(
      'redocly lint applications/resources/openapi-or.yaml --config=applications/x-redocly.yaml'
    )
    expect(stderr).toMatchSnapshot()
  })

  test('distribytivity in x-types', () => {
    const {stderr} = runCommand(
      'redocly lint applications/resources/openapi-with-nested-ors-in-ands.yaml --config=applications/x-redocly.yaml'
    )
    expect(stderr).toMatchSnapshot()
  })

  test('x-types described with x-types themselves', () => {
    const {stderr} = runCommand(
      'redocly lint applications/resources/x-types-described-with-x-types.yaml  --config=applications/x-redocly.yaml'
    )
    expect(stripCWD(stderr)).toMatchSnapshot()
  })

  test('openapi with external $refs', () => {
    const {stderr} = runCommand(
      'redocly lint applications/resources/openapi-with-external-refs.yaml  --config=applications/x-redocly.yaml'
    )
    expect(stripCWD(stderr)).toMatchSnapshot()
  })

  test('openapi writeOnly and readOnly fields', () => {
    const {stderr} = runCommand(
      'redocly lint applications/resources/openapi-with-writeonly-and-readonly.yaml --config=applications/x-redocly.yaml'
    )
    expect(stripCWD(stderr)).toMatchSnapshot()
  })
})
