const assert = require('assert')
const { Manager, EVENTS } = require('../src/manager')

describe('Command manager testing', () => {
  let manager
  const injection = {
    time: 'timeString'
  }

  const commands = [
    {
      name: 'print',
      title: 'Letter print command.',
      description: 'This is a command of the printer that allows to print something on a sheet.',
      group: 'MFP',
      arguments: [
        {
          key: '--format',
          description: 'The format of a printing letter.'
        },
        {
          key: '--orientation',
          description: 'Paper orientation.'
        }
      ],
      handler: ({command, injection}) => {
        return Promise.resolve(`${command.name} has been processed. injector - ${injection.time}`)
      }
    },
    {
      name: 'draw',
      group: 'MFP',
      arguments: [
        {
          key: '--type',
          description: 'A type of ink.'
        }
      ]
    },
    {
      name: 'command',
      handler: () => Promise.resolve(true)
    },
    {
      name: 'invokeError',
      handler: () => {
        throw new Error('Test error.')
      }
    }
  ]

  before(() => {
    manager = new Manager(commands, injection)
  })

  it('Default group without definition.', () => {
    const request = {
      name: 'command',
    }
    const command =  manager.get(request)
    assert.equal(command.name, request.name)
    assert.equal(command.group, 'default')
  })

  describe('Events', () => {
    it('Error invoking command.', (done) => {
      const request = {
        name: 'invokeError',
      }
      manager.events.once(EVENTS.error, ({e, request: _request}) => {
        assert.equal('Test error.', e.message)
        assert.equal(request.name, _request.name)
        done()
      })
      manager.execute(request)
    })

    it('Executed', (done) => {
      const request = {
        name: 'command',
      }
      manager.events.once(EVENTS.executed, ({request: _request}) => {
        assert.equal(request.name, _request.name)
        done()
      })
      manager.execute(request)
    })
  })

  it('Get', () => {
    const request = {
      name: 'print',
      group: 'MFP'
    }
    const command =  manager.get(request)
    assert.equal(command.name, request.name)
  })

  it('Command not found', async (done) => {
    const request = {
      name: 'print_does_not_exist',
    }
    manager.events.once(EVENTS.error, ({e, request: _request}) => {
      assert.equal('Command not found!', e.message)
      assert.equal(request.name, _request.name)
      done()
    })
    await manager.execute(request)
  })

  it('Prints command list', () => {
    const outPut = manager.toString()
    const etalon = 'print - Letter print command.\ndraw\ncommand\ninvokeError'
    assert.equal(outPut, etalon)
  })

  it('Prints full description of a command', () => {
    const request = {
      name: 'print',
      group: 'MFP'
    }
    const command =  manager.get(request)
    const outPut = manager.commandToString(command);
    const etalon = 'print - Letter print command.\n' +
      'This is a command of the printer that allows to print something on a sheet.\n' +
      '\t--format - The format of a printing letter.\n' +
      '\t--orientation - Paper orientation.'
    assert.equal(outPut, etalon)
  })

  it('Executes the command', async () => {
    const request = {
      name: 'print',
      group: 'MFP',
      args: [
        {
          key: '--format',
          value: 'A4',
          short: 'false'
        }
      ]
    }
    const result = await manager.execute(request)
    const etalon = 'print has been processed. injector - timeString'
    assert.equal(result, etalon)
  })
})
