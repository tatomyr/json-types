/**
 * Transforms a json-schema to x-types (WIP)
 *
 * example run: `node applications/json-schema-examples/transformer.js applications/json-schema-examples/blog-post.schema.yaml > applications/json-schema-examples/blog-post.x-type.yaml`
 */

import fs from 'fs'
import {parseYaml, stringifyYaml} from '@redocly/openapi-core'
import {translateJSONSchemaToXType} from '../json-schema-adapter.js'

const transform = jsonSchema => {
  const ctx = {
    resolve: node => ({
      node: {
        type: 'string',
        enum: ['$ref:' + node.$ref],
      },
    }),
  }
  return translateJSONSchemaToXType(jsonSchema, ctx)
}

const fileName = process.argv[2]
const content = fs.readFileSync(fileName, 'utf8')
const transformed = transform(parseYaml(content))
process.stdout.write(stringifyYaml(transformed))
