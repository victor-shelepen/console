const assert = require('assert')
const { runCLI, EVENTS, runCommand } = require('../src/cli')
const EventEmitter = require('events')
const { _console } = require('./helper')

describe('Commander', () => {
  it('Run commander', async () => {
    await runCommand(
      [
        {
          name: 'print',
          title: 'Prints values',
          handler: async ({ injection: { console } }) => {
            console.log('Run commander testing.')

            return true
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
})

describe('CLI', () => {
  let readline, _console, cli

  before(() => {
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
