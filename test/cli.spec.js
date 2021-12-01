import { runCLI, runCommand, EVENTS, bootstrapCommandManager } from '../src'
import EventEmitter from 'events'
import { _console } from './helper'

describe('Commander run', () => {
  beforeEach(() => {
    _console.clear()
  })

  it('Run commander', async () => {
    await runCommand(
      ['print'],
      [
        {
          name: 'print',
          title: 'Prints values',
          handler: async ({ injection: { console } }) => {
            console.log('Run commander testing.')
          }
        },
      ],
      [],
      {
        console: _console
      }
    )
    const line = _console.objects.pop()
    expect(line).toBe('Run commander testing.')
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
  const manager = bootstrapCommandManager(commands, [], injection)

  it('Error', async () => {
    const request = {
      name: 'print',
    }
    await manager.execute(request)
    const line = _console.objects.pop()
    const etalon = 'Error: Printer does not work.'
    expect(line).toBe(etalon)
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
    expect(lines[0]).toBe(etalon)
    expect(lines[2]).toEqual(expect.stringMatching(/at Manager\.execute/i))
  })

})

describe('CLI', () => {
  let readline, cli

  beforeEach(() => {
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
    cli = runCLI('Greetings.', commands, [], {
      console: _console
    }, readline)
  })

  it('Greetings', () => {
    const line = _console.objects.pop()
    expect(line).toBe('Greetings.')
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
      expect(lines).toBe(etalon)
    })

    it('Show', () => {
      readline.emit('line', 'show show')
      const lines = _console.objects.pop()
      const etalon = 'show - Describes the command.'
      expect(lines).toBe(etalon)
    })

    it('Async', (done) => {
      readline.emit('line', 'async')
      cli.manager.events.once(EVENTS.executed, () => {
        const etalon = 'Async test.'
        const lines = _console.objects.pop()
        expect(lines).toBe(etalon)
        done()
      })
      const lines = _console.objects.pop()
      // TODO resolve.
      // expect(undefined).toBe(lines)
    })

    it('Exit', (done) => {
      readline.emit('line', 'exit')
      const lines = _console.objects.pop()
      const etalon = 'See you.'
      expect(lines).toBe(etalon)

      readline.once('end', (result) => {
        expect(result).toBe(true)
        done()
      })
    })
  })

})
