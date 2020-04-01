const { buildWeightFieldSortChecker } = require('../src/lib')
const assert = require('assert')

describe('Lib', () => {
  describe('Weight name sort checker', () => {
    const checker = buildWeightFieldSortChecker('name')

    it('With weights', () => {
      const a = { name: 'zebra', weight: -1 }
      const b = { name: 'apple', weight: 21 }
      const c = { name: 'zerro', weight: 21}
      let result = checker(a, b)
      assert.equal(result, -1)
      result = checker(b, a)
      assert.equal(result, 1)
      result = checker(b, c)
      assert.equal(result, -1)
    })

    it('Without weights', () => {
      const a = { name: 'zero' }
      const b = { name: 'apple' }
      const c = { name: 'apple' }
      let result = checker(a, b)
      assert.equal(result, 1)
      result = checker(b, a)
      assert.equal(result, -1)
      result = checker(b, c)
      assert.equal(result, 0)
    })
  })
})
