import { buildWeightFieldSortChecker } from './lib'
import EventEmitter from 'events'

export const EVENTS = {
  error: 'error',
  executed: 'executed'
}

export class Manager {
  constructor(commands, groups=[], injection=null) {
    this.setCommands(commands)
    this.injection = injection
    this.groups = [
      ...groups,
      ...[{
        name: 'default',
        title: 'Default',
        showSummary: false,
        description: 'Commands without groups are assembled into the default group.',
        weight: -1
      }]
    ]
    this.events = new EventEmitter()
  }

  async execute(request) {
    try {
      let command
      if (request) {
        command = this.get(request)
      }
      if (command == undefined) {
        command = this.getDefault()
        request = undefined
        if (!command) {
          throw new Error('Default command not found.')
        }
      }
      const result = await command.handler({command, request, injection: this.injection, manager: this})
      this.events.emit(EVENTS.executed, { request, result })

      return result
    }
    catch(e) {
      this.events.emit(EVENTS.error, {e, request})
    }
  }

  setCommands(commands) {
    commands.forEach((command) => {
        if (!command.weight) {
          command.weight = 0
        }
        if (!command.group) {
          command.group = 'default'
        }
      })
    commands = commands
      .sort(buildWeightFieldSortChecker('name'))

    this.commands = commands
  }

  get({name, group='default'}) {
    return this.commands
      .find((c) => c.name === name && c.group === group)
  }

  getDefault() {
    return this.commands
      .find((c) => c.default === true)
  }

  getGroupCommands(name='default') {
    return this.commands
      .filter(c => c.group == name)
  }

  toString() {
    return this.groups
      .sort(buildWeightFieldSortChecker('title'))
      .map(e => this.groupToString(e.name))
      .join('\n')
  }

  getGroupDefinition(name='default') {
    return this.groups.find(e => e.name === name)
  }

  groupToString(name='default') {
    const groupDefition = this.getGroupDefinition(name)
    const commands = this.getGroupCommands(name)
    let groupSummary = ''
    if (groupDefition.showSummary == undefined || groupDefition.showSummary === true) {
      groupSummary = `${groupDefition.title} - ${groupDefition.description}`
    }

    return groupSummary
      + commands.map(c => '\t' + this.commandSummary(c)).join('\n')
  }

  commandSummary(command) {
    return command.name
    + (command.title ? ` - ${command.title}`: '')
  }

  commandToString(command) {
    let output = this.commandSummary(command)
      + (command.description ? `\n${command.description}` : '');
    if (command.arguments && command.arguments.length > 0) {
      output += '\n' + command.arguments.map(a => `\t${a.key} - ${a.description}`).join('\n');
    }

    return output
  }
}

