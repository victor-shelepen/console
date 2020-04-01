const assert = require('assert')
const { runCLI, runCommand, EVENTS, bootstrapCommandManager } = require('../src')
const EventEmitter = require('events')
const { _console } = require('./helper')

describe('Commander run', () => {
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
})

describe('Manager assembled', () => {
  const commands = [
    {
      name: 'print',
      title: 'Prints values',
      handler: async () => {
        throw new Error('Printer does not work.')
      }
    },
  ]
  const injection = {
    console: _console
  }
  const manager = bootstrapCommandManager(commands, injection)

  it('Error', async () => {
    const request = {
      name: 'print',
    }
    await manager.execute(request)
    const line = _console.objects.pop()
    const etalon = 'Error: Printer does not work.'
    assert.equal(line, etalon)
  })

  it('Error with stack', async () => {
    const request = {
      name: 'print',
      args: [{
        key: 'stack',
        value: 'true',
        short: false
      }]
    }
    await manager.execute(request)
    const lines = _console.objects.pop().split('\n')
    const etalon = 'Error: Printer does not work.'
    assert.equal(lines[0], etalon)
    assert.notEqual(lines[2].match(/at Manager\.execute/i), null)
  })

})

describe('CLI', () => {
  let readline, cli

  before(() => {
    _console.clear()
    readline = new EventEmitter()
    readline.close = function() {
      this.emit('end', true)
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
        '\tasync - Async example.\n' +
        '\tlist - Lists commands available.\n' +
        '\tshow - Describes the command.\n' +
        '\texit - It terminates the application.'
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
      cli.manager.events.once(EVENTS.executed, () => {
        const etalon = 'Async test.'
        const lines = _console.objects.pop()
        assert.equal(lines, etalon)
        done()
      })
      const lines = _console.objects.pop()
      assert.equal(undefined, lines)
    })

    it('Exit', (done) => {
      readline.emit('line', 'exit')
      const lines = _console.objects.pop()
      const etalon = 'See you.'
      assert.equal(lines, etalon)

      readline.once('end', (result) => {
        assert.equal(result, true)
        done()
      })
    })
  })

})
