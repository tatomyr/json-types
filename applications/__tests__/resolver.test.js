import {describe, expect, test} from 'vitest'
import {resolveAndMerge} from '../x-types-resolver.js'

describe('resolver', () => {
  test('transform a correct $and into an object', () => {
    const merged = resolveAndMerge(
      {$and: [{az: 'string'}, {bukh: 'number'}]},
      {}
    )
    expect(merged).toEqual({az: 'string', bukh: 'number'})
  })

  test('transform an incorrect $and into `never`', () => {
    expect(resolveAndMerge({$and: ['string', 'number']}, {})).toEqual(
      'undefined'
    )

    expect(resolveAndMerge({$and: []}, {})).toEqual('undefined')

    expect(
      resolveAndMerge({$and: [{az: 'string'}, {array: 'string'}]}, {})
    ).toEqual('undefined')

    expect(resolveAndMerge({$and: {}}, {})).toEqual('undefined')

    expect(resolveAndMerge({$and: [42, true]}, {})).toEqual('undefined')
  })

  test('neutrality in $and', () => {
    expect(resolveAndMerge({$and: ['az', 'any']}, {})).toEqual('az')
  })

  test('associativity in ORs', () => {
    expect(resolveAndMerge(['az', ['bukh', 'vidh']], {})).toEqual([
      'az',
      'bukh',
      'vidh',
    ])

    expect(resolveAndMerge([['az', 'bukh'], ['vidh']], {})).toEqual([
      'az',
      'bukh',
      'vidh',
    ])
  })

  test('associativity in $and', () => {
    expect(
      resolveAndMerge(
        {$and: [{$and: [{az: 'string'}, {bukh: 'string'}]}, {vidh: 'string'}]},
        {}
      )
    ).toEqual({az: 'string', bukh: 'string', vidh: 'string'})

    expect(
      resolveAndMerge(
        {$and: [{az: 'string'}, {$and: [{bukh: 'string'}, {vidh: 'string'}]}]},
        {}
      )
    ).toEqual({az: 'string', bukh: 'string', vidh: 'string'})
  })

  test('distributivity in nested ORs in $and', () => {
    expect(
      resolveAndMerge(
        {$and: [{az: 'string'}, [{bukh: 'string'}, {vidh: 'string'}]]},
        {}
      )
    ).toEqual([
      {az: 'string', bukh: 'string'},
      {az: 'string', vidh: 'string'},
    ])

    expect(
      resolveAndMerge(
        {$and: [[{az: 'string'}, {bukh: 'string'}], {vidh: 'string'}]},
        {}
      )
    ).toEqual([
      {az: 'string', vidh: 'string'},
      {bukh: 'string', vidh: 'string'},
    ])

    expect(
      resolveAndMerge(
        {
          $and: [
            [{az: 'string'}, {bukh: 'string'}],
            [{az: 'string'}, {vidh: 'string'}],
          ],
        },
        {}
      )
    ).toEqual([
      {az: 'string'},
      {az: 'string', vidh: 'string'},
      {az: 'string', bukh: 'string'},
      {bukh: 'string', vidh: 'string'},
    ])
  })

  // TODO: implement this
  test.skip('idempotence in ORs', () => {
    expect(resolveAndMerge(['az', 'az'], {})).toEqual('az')
  })

  test('idempotence in $and', () => {
    expect(resolveAndMerge({$and: ['az', 'az']}, {})).toEqual('az')

    expect(
      resolveAndMerge(
        {$and: [{az: 'string'}, {bukh: 'string'}, {az: 'string'}]},
        {}
      )
    ).toEqual({az: 'string', bukh: 'string'})
  })

  test('handle empty OR', () => {
    expect(resolveAndMerge([], {})).toEqual('undefined')
  })

  test('handle empty $and', () => {
    expect(resolveAndMerge({$and: []}, {})).toEqual('undefined')
  })

  test('escape single OR', () => {
    expect(resolveAndMerge(['az'], {})).toEqual('az')
  })

  test('escape single $and', () => {
    expect(resolveAndMerge({$and: ['az']}, {})).toEqual('az')
  })

  test('circular references', () => {
    expect(
      resolveAndMerge(
        {
          Json: [
            'string',
            'number',
            'boolean',
            null,
            {$ref: '#/Record'},
            {array: {$ref: '#/Json'}},
          ],
          Record: {
            string: {$ref: '#/Json'},
          },
        },
        {
          resolve: ({$ref}) => {
            switch ($ref) {
              case '#/Json':
                return {
                  node: [
                    'string',
                    'number',
                    'boolean',
                    null,
                    {string: {$ref: '#/Json'}},
                    {array: {$ref: '#/Json'}},
                  ],
                  location: {source: {absoluteRef: '#/Json'}},
                }
              case '#/Record':
                return {
                  node: {string: {$ref: '#/Json'}},
                  location: {source: {absoluteRef: '#/Record'}},
                }
              default:
                throw new Error('Unknown $ref')
            }
          },
          _circularRefsMaxDepth: 1,
        }
      )
    ).toEqual({
      Json: [
        'string',
        'number',
        'boolean',
        null,
        {
          string: [
            'string',
            'number',
            'boolean',
            null,
            {string: 'any'},
            {array: 'any'},
          ],
        },
        {
          array: [
            'string',
            'number',
            'boolean',
            null,
            {string: 'any'},
            {array: 'any'},
          ],
        },
      ],
      Record: {
        string: [
          'string',
          'number',
          'boolean',
          null,
          {string: 'any'},
          {array: 'any'},
        ],
      },
    })
  })
})
