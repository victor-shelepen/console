const assert = require('assert')
import {
  extractValue,
  parse,
  parseArgument,
  parseCommand,
  replaceSecretSpaces,
  replaceSpacesInBrackets,
  secretSpace,
  stringToTokens,
  tokensToCommand
} from '../src/parser'

describe('CLI parser testing', () => {
  describe('Extract value', () => {
    it('No value', () => {
      const args = [
        { key: 'a', value: 'A' },
        { key: 'b', value: 'A' }
      ]
      const value = extractValue(args, 'c')
      assert.equal(value, undefined)
    })

    it('Single', () => {
      const args = [
        { key: 'a', value: 'A' },
        { key: 'b', value: 'A' }
      ]
      const value = extractValue(args, 'a')
      assert.equal(value, 'A')
    })

    it('Multiple', () => {
      const args = [
        { key: 'a', value: 'A' },
        { key: 'b', value: 'Ba' },
        { key: 'b', value: 'Bb' }
      ]
      const values = extractValue(args, 'b')
      assert.equal(values.length, 2)
      assert.equal(values[0], 'Ba')
      assert.equal(values[1], 'Bb')
    })
  })

  describe('String to tokens', () => {
    it('Replace spaces in brackets.', () => {
      const string = replaceSpacesInBrackets(`a "b c" a ' d ' a`)
      assert.equal(string, 'a b#2909;c a #2909;d#2909; a')
    })

    it('Replace secret spaces', () => {
      const string = replaceSecretSpaces(`a${secretSpace}b${secretSpace}c`)
      assert.equal(string, 'a b c')
    })

    it('Without arguments', () => {
      const tokens = stringToTokens('printer.print')
      assert.equal(tokens[0], 'printer.print')
    })

    it('Common without brackets with shielded spaces.', () => {
      const tokens = stringToTokens(' --format=A4    --orientation=a\\ l\\ b\\ u\\ m printer.print  ')
      assert.equal(tokens[1], `--orientation=a${secretSpace}l${secretSpace}b${secretSpace}u${secretSpace}m`)
    })

    it.only('Common', () => {
      const tokens = stringToTokens(' --format=A4    --orientation="a l b u m" printer.print  ')
      assert.equal(tokens[1], `--orientation=a${secretSpace}l${secretSpace}b${secretSpace}u${secretSpace}m`)
    })
  })

  describe('Parse command', () => {
    it('Command pattern failed', () => {
      assert.throws(() => parseCommand('group#command'), 'Error: Command does not match to the command pattern')
    })

    it('With group defined', () => {
      const command = parseCommand('group.command')
      assert.equal('group', command.group),
      assert.equal('command', command.name)
    })

    it('Without a group', () => {
      const command = parseCommand('command')
      assert.equal('default', command.group),
      assert.equal('command', command.name)
    })

    it('BugFix currentOperator', () => {
      const command = parseCommand('currentOperator')
      assert.equal('default', command.group),
      assert.equal('currentOperator', command.name)
    })
  })

  describe('Argument parsing', () => {
    it('Fault case A - equal in argument value', () => {
      const token = parseArgument(`--format==A4`)
      assert.equal('=A4', token.value)
    })

    it('It is not an argument token', () => {
      assert.throws(
        () => {
          parseArgument('format=A4')
        },
        'Error: It is not an argument token'
      )
    })

    it('Common format', () => {
      const token = parseArgument(`--format=A4`)
      assert.equal('format', token.key)
      assert.equal(false, token.short)
    })

    it('Short format', () => {
      const token = parseArgument('-ok')
      assert.equal('ok', token.key)
      assert.equal(true, token.value)
      assert.equal(true, token.short)
    })
  })

  it('Tokens to command', () => {
    const command = tokensToCommand([`--format=A4`, '--once', 'printer.print'])
    const arg = command.args[0]
    assert.equal('format', arg.key)
    assert.equal('A4', arg.value)
    assert.equal('print', command.name)
    assert.equal(2, command.args.length)
  })

  it('Parse with values', () => {
    const command = parse('  --format=A4 --once    printer.print  val1 val2')
    assert.equal(command.values[0], 'val1')
    assert.equal(command.values[1], 'val2')
    const arg = command.args[0]
    assert.equal('format', arg.key)
    assert.equal('A4', arg.value)
    assert.equal('print', command.name)
    assert.equal(2, command.args.length)
  })

  it('Parse mixed ', () => {
    const command = parse('--format=A4 printer.print 2 --once val1')
    const arg = command.args[0]
    assert.equal('format', arg.key)
    assert.equal('A4', arg.value)
    assert.equal('print', command.name)
    assert.equal(2, command.args.length)
  })

  it('Different spaces in different places.', () => {
    const command = parse('--a=be\\ good --b="do well" print A4\\ A5 "A6 A7"')
    assert(command.values[0], 'A4 A5')
    assert(command.values[1], 'A6 A7')
    assert(command.args[0].value, 'be good')
    assert(command.args[1].value, 'do well')
  })

})
