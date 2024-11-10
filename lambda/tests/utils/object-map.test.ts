import { describe, it, expect } from '@jest/globals'
import { objectMap } from '../../src/utils/object-map'

describe('Object map', () => {
  it('Should be handle with string key', () => {
    const obj = { a: 1, b: 2 }

    const mapped1 = objectMap(obj, (v) => 2 * v)
    expect(mapped1).toEqual({ a: 2, b: 4 })
    expect(obj === mapped1).toBeFalsy()

    const mapped2 = objectMap(obj, (v, k) => v + k)
    expect(mapped2).toEqual({ a: '1a', b: '2b' })
  })
  // it('should be handle with number key', () => {
  //   expect(objectMap({ 0: 1, 1: 2 }, (v) => 2 * v)).toEqual({ 0: 2, 1: 4 })
  // })
})
