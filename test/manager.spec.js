import assert from 'assert'
import { Manager, EVENTS } from '../src/manager'

describe('Command manager testing', () => {
  let manager
  const injection = {
    time: 'timeString'
  }

  const groups = [
    {
      name: 'MFP',
      title: 'MFP',
      description: 'Multi functional printer'
    }
  ]

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
    },
    {
      name: 'z-command',
      default: true,
      handler: () => {

        return 'z-command has been executed.'
      }
    },
    {
      name: 'exit',
      weight: 1
    }
  ]

  beforeEach(() => {
    manager = new Manager(commands, injection, groups)
  })

  describe('Groups', () => {
    it('Get commands', () => {
      const commands = manager.getGroupCommands()
      expect(commands.length).toBe(4)
    })

    it('Get group defition', () => {
      const definition = manager.getGroupDefinition('default')
      expect('Default').toBe(definition.title)
    })

    it('To string - without group summary', () => {
      const string = manager.groupToString()
      const etalon = '\tcommand\n'
        + '\tinvokeError\n'
        + '\tz-command\n'
        + '\texit'
      expect(string).toBe(etalon)
    })

    it('To string - with group summary', () => {
      const defaultGroupDefinition = manager.getGroupDefinition('default')
      defaultGroupDefinition.showSummary = true
      const string = manager.groupToString()
      const etalon = 'Default - Commands without groups are assembled into the default group.'
        + '\tcommand\n'
        + '\tinvokeError\n'
        + '\tz-command\n'
        + '\texit'
      expect(string).toBe(etalon)
    })
  })

  it('Default group without definition.', () => {
    const request = {
      name: 'command',
    }
    const command =  manager.get(request)
    expect(command.name).toBe(request.name)
    expect(command.group).toBe('default')
  })

  describe('Events', () => {
    it('Error invoking command.', (done) => {
      const request = {
        name: 'invokeError',
      }
      manager.events.once(EVENTS.error, ({e, request: _request}) => {
        expect('Test error.').toBe(e.message)
        expect(request.name).toBe(_request.name)
        done()
      })
      manager.execute(request)
    })

    it('Executed', (done) => {
      const request = {
        name: 'command',
      }
      manager.events.once(EVENTS.executed, ({request: _request}) => {
        expect(request.name).toBe(_request.name)
        done()
      })
      manager.execute(request)
    })
  })

  it('Get command', () => {
    const request = {
      name: 'print',
      group: 'MFP'
    }
    const command =  manager.get(request)
    expect(command.name).toBe(request.name)
  })

  describe('Command', () => {
    let command

    beforeEach(() => {
      const request = {
        name: 'print',
        group: 'MFP'
      }
      command =  manager.get(request)
    })

    it('Command summary', () => {
      const commandSummary = manager.commandSummary(command)
      expect(commandSummary).toBe('print - Letter print command.')
    })

    it('Get default', () => {
      const command = manager.getDefault()
      expect(command.name).toBe('z-command')
    })
  })

  it('Default command not found', async (done) => {
    const defaultCommand = manager.getDefault()
    defaultCommand.default = false
    manager.events.once(EVENTS.error, ({e}) => {
      expect('Default command not found.').toBe(e.message)
      defaultCommand.default = true
      done()
    })
    await manager.execute()
  })

  it('Prints command list', () => {
    const outPut = manager.toString()
    const etalon = 	'\tcommand\n' +
      '\tinvokeError\n' +
      '\tz-command\n' +
      '\texit\n' +
      'MFP - Multi functional printer\tdraw\n' +
      '\tprint - Letter print command.'
    expect(outPut).toEqual(etalon)
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
    expect(outPut).toBe(etalon)
  })

  describe('Command execution', () => {
    it('Empty request - default command', (done) => {
      manager.events.once(EVENTS.executed, ({request, result}) => {
        expect(undefined).toBe(request)
        const etalon = 'z-command has been executed.'
        expect(etalon).toBe(result)
        done()
      })
      manager.execute()
    })

    it('Command does not exist - default command', (done) => {
      manager.events.once(EVENTS.executed, ({request, result}) => {
        expect(undefined).toBe(request)
        const etalon = 'z-command has been executed.'
        expect(etalon).toBe(result)
        done()
      })
      const request = {
        name: 'not-found'
      }
      manager.execute(request)
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
      expect(result).toBe(etalon)
    })
  })
})
