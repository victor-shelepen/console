const parserLib = require('./lib/parser');
const commanderLib = require('./lib/commander');

module.exports = {
  extractValue: parserLib.extractValue,
  parse: parserLib.parse,
  register: commanderLib.register,
  executeCommand: commanderLib.executeCommand
}
