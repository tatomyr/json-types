/* global process */
/**
 * Testing json-schema + x-types validation with hyperjump (WIP)
 *
 * example run: `node applications/json-schema-examples/validator.js blog-post` where `blog-post` refers to the corresponding file group in `applications/json-schema-examples/`
 */

import fs from 'fs'
import {registerSchema, validate} from '@hyperjump/json-schema/draft-2020-12'
import {BASIC} from '@hyperjump/json-schema/experimental'
// import {FLAG  } from '@hyperjump/json-schema'
// import { addMediaTypePlugin, removeMediaTypePlugin, setMediaTypeQuality } from "@hyperjump/browser";
import {parseYaml} from '@redocly/openapi-core'
import {translateXTypeToSchema} from '../x-types-adapter.js'
import {resolveAndMerge} from '../x-types-resolver.js'
import {Context} from './resolver.js'

const check = (schema, fileName) => async json => {
  const id = `http://localhost:8080/${fileName}`
  await registerSchema(
    schema,
    id,
    'https://json-schema.org/draft/2020-12/schema'
  )
  const output = await validate(id, json, BASIC)
  console.log(output)
}

const filePath = 'applications/json-schema-examples/'
const name = process.argv[2]

const schemaContent = fs.readFileSync(filePath + name + '.schema.json', 'utf8')
const schema = parseYaml(schemaContent)

const exampleContent = fs.readFileSync(
  filePath + name + '.example.json',
  'utf8'
)
const example = JSON.parse(exampleContent)

// FIXME: this fails for blog-post because it cannot load the `$ref: user-profile.schema.json` properly (even with `(cd applications/json-schema-examples && npx http-server --mimetypes '{ "application/reference+json": ["json"] }')`).
// await check(schema, name + '.schema.json')(example)

const ctx = new Context(filePath + name + '.x-type.yaml')
const parsedXType = ctx.document.parsed

const resolvedXType = resolveAndMerge(parsedXType, ctx)
console.dir(resolvedXType, {depth: null})
const convertedSchema = translateXTypeToSchema(resolvedXType)

await check(convertedSchema, name + '.x-type.yaml')(example)
