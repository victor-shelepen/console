const { extractValue, parse, parseCommand } = require('./parser');
const { Manager } = require('./manager')
const { runCLI, runCommand } = require('./cli')

module.exports = {
  runCLI,
  runCommand,
  extractValue,
  parse,
  parseCommand,
  Manager
}
