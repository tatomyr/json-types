/* global process */
/**
 * Transforms a json-schema to x-types using bundleFromString approach
 *
 * example run: `node applications/json-schema-examples/transformer.js applications/json-schema-examples/blog-post.schema.yaml > applications/json-schema-examples/blog-post.x-type.yaml`
 */

import path from 'path'
import {
  stringifyYaml,
  bundleFromString,
  createConfig,
  loadConfig,
} from '@redocly/openapi-core'

const ROOT_X_TYPE = 'X-Test'

const transformUsingBundle = async fileName => {
  const jsonSchemaFilePath = path.resolve(fileName)

  // Create a minimal OpenAPI document with a $ref to the schema
  const openApiDoc = `
    openapi: '3.1.0'
    info: 
      title: 'Schema Transformer'
      version: '1.0.0'
    components: 
      schemas: 
        ${ROOT_X_TYPE}:
          $ref: ${jsonSchemaFilePath}
  `

  // Bundle the OpenAPI document to resolve the $ref and prepare it for transformation
  const tempBundled = await bundleFromString({
    source: openApiDoc,
    config: await createConfig({}),
  })

  // Bundle using x-type.redocly.yaml config to transform the schema to x-type
  const configPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    '../generate-x-types.redocly.yaml'
  )
  const config = await loadConfig({configPath})
  const bundledDoc = await bundleFromString({
    source: JSON.stringify(tempBundled.bundle.parsed),
    config,
  })

  // Extract the x-type from bundled components/schemas
  const xTypes = bundledDoc?.bundle?.parsed?.components?.['x-types']

  return xTypes
}

const fileName = process.argv[2]
const result = await transformUsingBundle(fileName)

process.stdout.write(stringifyYaml(result[ROOT_X_TYPE]))
