const assert = require('assert')
const { runCLI, EVENTS, runCommand } = require('../src/cli')
const EventEmitter = require('events')
const { _console } = require('./helper')

describe('Commander', () => {
  before(() => {
    _console.clear()
  })

  it('Run commander', async () => {
    await runCommand(
      [
        {
          name: 'print',
          title: 'Prints values',
          handler: async ({ injection: { console } }) => {
            console.log('Run commander testing.')
          }
        },
      ],
      {
        console: _console
      },
      ['print']
    )
    const line = _console.objects.pop()
    assert.equal(line, 'Run commander testing.')
  })

  describe('Handle error message', async () => {
    const runWithError = async (tokens) => {
      await runCommand(
        [
          {
            name: 'print',
            title: 'Prints values',
            handler: async ({ injection: { console } }) => {
              throw new Error('Printer does not work.')
            }
          },
        ],
        {
          console: _console
        },
        tokens
      )
    }

    it('Error', async () => {
      await runWithError(['print'])
      const line = _console.objects.pop()
      const etalon = 'Error: Printer does not work.'
      assert.equal(line, etalon)
    })

    it('Error with stack', async () => {
      await runWithError(['print', '--stack'])
      const lines = _console.objects.pop().split('\n')
      const etalon = 'Error: Printer does not work.'
      assert.equal(lines[0], etalon)
      assert.notEqual(lines[6].match(/at callFn/i), null)
    })
  })
})

describe('CLI', () => {
  let readline, cli

  before(() => {
    _console.clear()
    readline = new EventEmitter()
    readline.close = function() {
      this.isClosed = true
    }
    const commands = [
      {
        name: 'async',
        title: 'Async example.',
        handler: async ({ injection: { console } }) => {
          const promise = new Promise((resolve) => {
            setTimeout(() => {
              resolve('Async test.')
            }, 0)
          })

          const output = await promise
          console.log(output)
        }
      },
    ]
    cli = runCLI('Greetings.', commands, {
      console: _console
    }, readline)
  })

  it('Greetings', () => {
    const line = _console.objects.pop()
    assert.equal(line, 'Greetings.')
  })

  describe('Commands', () => {
    it('List', () => {
      readline.emit('line', 'list')
      const lines = _console.objects.pop()
      const etalon = 'Available commands:\n' +
        '\n' +
        'list - Lists commands available.\n' +
        'show - Describes the command.\n' +
        'exit - It terminates the application.\n' +
        'async - Async example.';
      assert.equal(lines, etalon)
    })

    it('Show', () => {
      readline.emit('line', 'show show')
      const lines = _console.objects.pop()
      const etalon = 'show - Describes the command.'
      assert.equal(lines, etalon)
    })

    it('Async', (done) => {
      readline.emit('line', 'async')
      cli.events.once(EVENTS.commandExecuted, () => {
        const etalon = 'Async test.'
        const lines = _console.objects.pop()
        assert.equal(lines, etalon)
        done()
      })
      const lines = _console.objects.pop()
      assert.equal(undefined, lines)
    })

    it('Exit', () => {
      readline.emit('line', 'exit')
      const lines = _console.objects.pop()
      const etalon = 'See you.'
      assert.equal(lines, etalon)

      // @todo Bug: async pipe is not chained.
      // assert.equal(readline.isClosed, true)
    })
  })

})
