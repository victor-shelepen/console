(async function() {
  // const ccm = require('console-command-manager')
  const ccm = require('../src/index')
  const readline = require('readline')

  const commands = [
    {
      name: 'exit',
      group: 'default', // @todo refactore...
      title: 'It terminates the application.',
      handler: (command) => {
        console.log('See you.')

        return Promise.resolve(false)
      }
    },
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
        console.dir(command)
        console.log(command.name + ' has been processed.')

        return Promise.resolve(true)
      }
    }
  ]

  const locator = ccm.register(commands)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.on('line', async (input) => {
    const command = ccm.parse(input)
    const toContinue = await ccm.executeCommand(locator, command)
    if (!toContinue) {
      rl.close()
    }
  })
})()
