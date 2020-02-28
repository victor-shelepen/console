const secretEqual = '#2909;'

function stringToTokens (string) {
  string += ' '
  const tokens = []
  let pass = false
  let chunk = []
  for (let char of string) {
    if (char === '"') {
      pass = !pass
      continue
    }

    if (!pass) {
      if (char === '=') {
        char = secretEqual
      }
    }

    if (char === ' ' && !pass) {
      if (chunk.length > 0) {
        tokens.push(chunk.join(''))
        chunk = []
      } else {
        // Noop.
      }
    } else {
      chunk.push(char)
    }
  }

  return tokens
}

function tokensToCommand (_tokens) {
  const tokens = [..._tokens]
  const argTokens = []
  const commandTokens = []
  for (const token of tokens) {
    if (token[0] === '-') {
      argTokens.push(token)
    } else {
      commandTokens.push(token)
    }
  }
  if (!commandTokens.length === 0) {
    throw new Error('There is not a command.')
  }
  const commandToken = commandTokens.shift()
  const values = commandTokens
  const command = parseCommand(commandToken)
  const args = argTokens.map(parseArgument)

  return {
    ...command,
    values,
    args
  }
}

function parseCommand (token) {
  if (!token.match(/^[\w,.,]+$/g)) {
    throw new Error(`Command does not match to the command pattern - '${token}'.`)
  }
  const commandParts = token.split('.')
  let name = commandParts[0]
  let group = 'default'
  if (commandParts instanceof Array && commandParts.length > 1) {
    [group, name] = commandParts
  }

  return {
    token,
    name,
    group
  }
}

function parseArgument (token) {
  let short = false
  if (token.substr(0, 2) === '--') {
    token = token.substr(2)
  } else if (token.substr(0, 1) === '-') {
    token = token.substr(1)
    short = true
  } else {
    throw new Error('It is not an argument token.')
  }
  const [key, value = true] = token.split(secretEqual, 2)

  return {
    key,
    value,
    short
  }
}

function extractValue (args, key, defaultVal=null) {
  const arg = args
    .filter(arg => arg.key === key)
  if (arg.length === 0) {
    return defaultVal
  } else if (arg.length == 1) {
    return arg[0].value
  }

  return arg.map(arg => arg.value)
}

function parse (str) {
  const tokens = stringToTokens(str)

  return tokensToCommand(tokens)
}

module.exports = {
  stringToTokens,
  tokensToCommand,
  extractValue,
  parseCommand,
  parseArgument,
  parse,
  secretEqual
}
