const assert = require('assert')
const parserLib = require('../src/lib/parser')

describe('CLI parser testing', () => {
  describe('Extract value', () => {
    it('No value', () => {
      const args = [
        { key: 'a', value: 'A' },
        { key: 'b', value: 'A' }
      ]
      const value = parserLib.extractValue(args, 'c')
      assert.equal(value, undefined)
    })

    it('Single', () => {
      const args = [
        { key: 'a', value: 'A' },
        { key: 'b', value: 'A' }
      ]
      const value = parserLib.extractValue(args, 'a')
      assert.equal(value, 'A')
    })

    it('Multiple', () => {
      const args = [
        { key: 'a', value: 'A' },
        { key: 'b', value: 'Ba' },
        { key: 'b', value: 'Bb' }
      ]
      const values = parserLib.extractValue(args, 'b')
      assert.equal(values.length, 2)
      assert.equal(values[0], 'Ba')
      assert.equal(values[1], 'Bb')
    })
  })

  describe('String to tokens', () => {
    it('Without arguments', () => {
      const tokens = parserLib.stringToTokens('printer.print')
      assert.equal(tokens[0], 'printer.print')
    })

    it('Common', () => {
      const tokens = parserLib.stringToTokens(' --format=A4    --orientation="a l b u m" printer.print  ')
      assert.equal(tokens[1], `--orientation${parserLib.secretEqual}a l b u m`)
    })
  })

  describe('Parse command', () => {
    it('Command pattern failed', () => {
      assert.throws(() => parserLib.parseCommand('group#command'), 'Error: Command does not match to the command pattern')
    })

    it('With group defined', () => {
      const command = parserLib.parseCommand('group.command')
      assert.equal('group', command.group),
      assert.equal('command', command.name)
    })

    it('Without a group', () => {
      const command = parserLib.parseCommand('command')
      assert.equal('default', command.group),
      assert.equal('command', command.name)
    })

    it('BugFix currentOperator', () => {
      const command = parserLib.parseCommand('currentOperator')
      assert.equal('default', command.group),
      assert.equal('currentOperator', command.name)
    })
  })

  describe('Argument parsing', () => {
    it('It is not an argument token', () => {
      assert.throws(
        () => {
          const token = parserLib.parseArgument('format=A4')
        },
        'Error: It is not an argument token'
      )
    })

    it('Common format', () => {
      const token = parserLib.parseArgument(`--format${parserLib.secretEqual}=A4`)
      assert.equal('format', token.key)
      assert.equal('=A4', token.value)
      assert.equal(false, token.short)
    })

    it('Short format', () => {
      const token = parserLib.parseArgument('-ok')
      assert.equal('ok', token.key)
      assert.equal(true, token.value)
      assert.equal(true, token.short)
    })
  })

  it('Tokens to command', () => {
    const command = parserLib.tokensToCommand([`--format${parserLib.secretEqual}=A4`, '--once', 'printer.print'])
    const arg = command.args[0]
    assert.equal('format', arg.key)
    assert.equal('=A4', arg.value)
    assert.equal('print', command.name)
    assert.equal(2, command.args.length)
  })

  it('Parse with values', () => {
    const command = parserLib.parse('  --format="=A4" --once    printer.print  val1 val2')
    assert.equal(command.values[0], 'val1')
    assert.equal(command.values[1], 'val2')
    const arg = command.args[0]
    assert.equal('format', arg.key)
    assert.equal('=A4', arg.value)
    assert.equal('print', command.name)
    assert.equal(2, command.args.length)
  })

  it('Parse mixed ', () => {
    const command = parserLib.parse('--format="=A4" printer.print 2 --once val1')
    const arg = command.args[0]
    assert.equal('format', arg.key)
    assert.equal('=A4', arg.value)
    assert.equal('print', command.name)
    assert.equal(2, command.args.length)
  })

})
