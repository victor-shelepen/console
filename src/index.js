const { extractValue, parse, parseCommand } = require('./parser');
const { Manager, EVENTS } = require('./manager')
const { runCLI, runCommand, bootstrapCommandManager } = require('./cli')

module.exports = {
  bootstrapCommandManager,
  runCLI,
  runCommand,
  extractValue,
  parse,
  parseCommand,
  Manager,
  EVENTS
}
