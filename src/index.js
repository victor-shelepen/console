const { extractValue, parse, parseCommand } = require('./parser');
const { Manager } = require('./manager')
const { runCLI } = require('./cli')

module.exports = {
  runCLI,
  extractValue,
  parse,
  parseCommand,
  Manager
}
