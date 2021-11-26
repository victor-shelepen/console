import { parse, parseCommand, tokensToCommand, extractValue } from './parser'
import { Manager, EVENTS } from './manager'
import readline from 'readline'

const commands = [
  // List commands.
  {
    name: 'list',
    title: 'Lists commands available.',
    handler: ({ manager, injection: { console } }) => {
      const output = 'Available commands:\n\n' + manager.toString()
      console.log(output)
    }
  },

  {
    name: 'show',
    title: 'Describes the command.',
    handler: ({ manager, request, injection: { console } }) => {
      const commandRequest = parseCommand(request.values[0])
      const command = manager.get(commandRequest)
      const commandString = manager.commandToString(command)
      console.log(commandString)
    }
  },

  // Exit command.
  {
    name: 'exit',
    weight: 101,
    title: 'It terminates the application.',
    handler: ({ injection: { console, readLine } }) => {
      console.log('See you.')
      readLine.close()

      // To break the input cycle return false.
      return false
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

  async onLine(input) {
    // Cycled command processing.
    const command = parse(input)
    const toContinue = await this.manager.execute(command)

    // If termination signal is received the readline stream is closed. The application is closed.
    if (toContinue === false) {
      this.readline.close()
    }
  }
}

export function bootstrapCommandManager(_commands, groups=[], injection = null) {
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
  const manager = new Manager(allCommands, groups, injection)
  manager.events.on(EVENTS.error, ({ e, request }) => {
    const { console } = injection
    console.log(e.toString())
    const stack = extractValue(request.args, 'stack', false)
    if (stack) {
      console.log(e.stack)
    }
  })

  return manager
}

export function runCLI(greetings, _commands, groups=[], injection = null, readLine = null) {
  if (!readLine) {
    readLine = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  }
  if (injection) {
    injection = {
      ...injection,
      readLine
    }
  }

  const manager = bootstrapCommandManager(_commands, groups, injection)
  manager.events.on(EVENTS.executed, ({ request, result }) => {
    if (request.name == 'exit' && !!result) {
      cli.readline.close()
    }
  })
  const cli = new CLI(manager, readLine, greetings)
  const { console: _console } = injection
  _console.log(greetings)

  return cli
}

export function runCommand(tokens, _commands, groups=[], injection = null) {
  const manager = bootstrapCommandManager(_commands, groups, injection)
  const request = tokensToCommand(tokens)

  return manager.execute(request)
}
