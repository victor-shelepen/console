function initCommandLocator() {
  return []
}

function registerCommand(locator, cmd) {
  locator.push(cmd)
}

async function executeCommand(locator, cmd) {
  const command = locator.find((c) => c.name === cmd.name && c.group === cmd.group)
  return command.handler(cmd)
}

function printCommands(locator) {
  return locator
    .map(c => c.name + (c.title ? ` - ${c.title}` : ''))
    .join('\n')
}

function printCommand(command) {
  let output =  command.name
    + (command.title ? ` - ${command.title}`: '')
    + (command.description ? `\n${command.description}` : '');
  if (command.arguments.length > 0) {
    output += '\n' + command.arguments.map(a => `\t${a.key} - ${a.description}`).join('\n');
  }

  return output
}

function register(commands) {
  const locator = initCommandLocator();
  for (const command of commands) {
    registerCommand(locator, command)
  }

  return locator;
}

module.exports = {
  executeCommand,
  register,
  printCommand,
  printCommands
}
