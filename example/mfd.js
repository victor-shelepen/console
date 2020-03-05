(async function() {
  // const { Manager, parse } = require('console-command-manager')
  const { Manager, parse } = require('../src/index')
  const readline = require('readline')

  // Command definitions.
  const commands = [

    // Exit command.
    {
      name: 'exit',
      group: 'default', // @todo refactore...
      title: 'It terminates the application.',
      handler: () => {
        console.log('See you.')

        // To break the input cycle return false.
        return Promise.resolve(false)
      }
    },

    // Print command.
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
      handler: ({ command, request, injection: { DateFactory } }) => {
        console.dir(command, request)
        console.log(`${command.name} has been processed. ${DateFactory.now()}`)

        return Promise.resolve(true)
      }
    }
  ]

  const injection = {
    DateFactory: Date
  }

  // Registers commands.
  const manager = new Manager(commands, injection)

  // Readline streams.
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.on('line', async (input) => {
    // Cycled command processing.
    const command = parse(input)
    const toContinue = await manager.execute(command)

    // If termination signal is received the readline stream is closed. The application is closed.
    if (!toContinue) {
      rl.close()
    }
  })
})()
