const { parse, parseCommand } = require('./parser')
const { Manager } = require('./manager')
const readline = require('readline')

const commands = [
  // List commands.
  {
    name: 'list',
    group: 'default', // @todo refactore...
    title: 'Lists commands available.',
    handler: async ({ manager, injection: { console } }) => {
      const output = 'Available commands:\n\n' + manager.toString()
      console.log(output)

      return true
    }
  },

  {
    name: 'show',
    group: 'default', // @todo refactore...
    title: 'Describes the command.',
    handler: async ({ manager, request, injection: { console } }) => {
      const commandRequest = parseCommand(request.values[0])
      const command = manager.get(commandRequest)
      const commandString = manager.commandToString(command)
      console.log(commandString)

      return true
    }
  },

  // Exit command.
  {
    name: 'exit',
    group: 'default', // @todo refactore...
    title: 'It terminates the application.',
    handler: ({ injection: { console } }) => {
      console.log('See you.')

      // To break the input cycle return false.
      return Promise.resolve(false)
    }
  }
]

class CLI {
  constructor(manager, readline, greetings) {
    this.manager = manager
    this.readline = readline
    this.greetings = greetings
    this.readline.on('line', this.onLine.bind(this))
  }

  async onLine (input) {
    // Cycled command processing.
    const command = parse(input)
    const toContinue = await this.manager.execute(command)

    // If termination signal is received the readline stream is closed. The application is closed.
    if (!toContinue) {
     this.readline.close()
    }
  }
}

function runCLI(greetings, _commands,   injection=null, readLine=null) {
  const _injection = {
    console
  }
  const allCommands = [
    ...commands,
    ..._commands
  ]
  if (injection) {
    injection = {
      ..._injection,
      ...injection
    }
  } else {
    injection = _injection
  }
  const manager = new Manager(allCommands, injection)
  if (!readLine) {
    readLine = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  }
  const cli = new CLI(manager, readLine, greetings)
  const { console: _console } = injection
  _console.log(greetings)

  return cli
}

module.exports = {
  commands,
  runCLI
}
