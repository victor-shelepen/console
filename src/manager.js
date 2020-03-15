class Manager {
  constructor(commands, injection) {
    this.setCommands(commands)
    this.injection = injection
  }

  async execute(request) {
    const command = this.get(request)

    return command.handler({command, request, injection: this.injection, manager: this})
  }

  setCommands(commands) {
    commands.forEach((command) => {
      if (!command.group) {
        command.group = 'default'
      }
    })

    this.commands = commands
  }

  get({name, group='default'}) {
    return this.commands
      .find((c) => c.name === name && c.group === group)
  }

  toString() {
    return this.commands
      .map(c => c.name + (c.title ? ` - ${c.title}` : ''))
      .join('\n')
  }

  commandToString(command) {
    let output = command.name
      + (command.title ? ` - ${command.title}`: '')
      + (command.description ? `\n${command.description}` : '');
    if (command.arguments && command.arguments.length > 0) {
      output += '\n' + command.arguments.map(a => `\t${a.key} - ${a.description}`).join('\n');
    }

    return output
  }
}

module.exports = {
  Manager
}
