const assert = require('assert')
const { Manager } = require('../src/manager')

describe('CLI commander testing', () => {
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

  it('Get', () => {
    const request = {
      name: 'print',
      group: 'MFP'
    }
    const command =  manager.get(request)
    assert.equal(command.name, request.name)
  })

  it('Prints command list', () => {
    const outPut = manager.toString()
    const etalon = 'print - Letter print command.\ndraw\ncommand'
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
