const assert = require('assert')
const commanderLib = require('../src/lib/commander')

describe('CLI commander testing', () => {
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
      handler: (command) => {
        return Promise.resolve(command.name + ' has been processed.')
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
    }
  ];
  const locator = commanderLib.register(commands)

  it('test', () => {
    assert.equal(1, 1)
  })

  it('Prints command list', () => {
    const outPut = commanderLib.printCommands(locator);
    const etalon = 'print - Letter print command.\ndraw'
    assert.equal(outPut, etalon)
  })

  it('Prints full description of a command', () => {
    const outPut = commanderLib.printCommand(locator[0]);
    console.log(outPut);
    const etalon = 'print - Letter print command.\n' +
      'This is a command of the printer that allows to print something on a sheet.\n' +
      '\t--format - The format of a printing letter.\n' +
      '\t--orientation - Paper orientation.'
    assert.equal(outPut, etalon)
  })

  it('Executes the command', async () => {
    const command = {
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
    const result = await commanderLib.executeCommand(locator, command)
    const etalon = 'print has been processed.'
    assert.equal(result, etalon)
  })
})
