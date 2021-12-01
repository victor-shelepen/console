const BRACKETS = ['"', '\'']
export const secretSpace = '#2909;'

export function replaceSecretSpaces(string) {
  const expression = new RegExp(secretSpace, 'g')

  return string.replace(expression, ' ')
}

export function replaceSpacesInBrackets(string) {
  let openChar
  let chunks = []
  let chunk = []
  for (let char of string) {
    if (!openChar && BRACKETS.indexOf(char) != -1) {
      openChar = char
      continue
    }
    if(openChar == char) {
      openChar = undefined
      chunks.push(chunk.join())
      chunk = []
      continue
    }
    if (openChar && char == ' ') {
      char = secretSpace
    }

    chunks.push(char)
  }

  return chunks.join('')
}

export function stringToTokens (string) {
  return replaceSpacesInBrackets(string)
    .replace(/\\ /gi, secretSpace)
    .split(' ')
    .filter(v => v != '')
}

export function tokensToCommand (_tokens) {
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
  if (commandTokens.length === 0) {
    throw new Error('There is not a command.')
  }
  const commandToken = commandTokens.shift()
  const values = commandTokens.map(replaceSecretSpaces)
  const command = parseCommand(commandToken)
  const args = argTokens.map(parseArgument)

  return {
    ...command,
    values,
    args
  }
}

export function parseCommand (token) {
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

export function parseArgument (token) {
  let short = false
  if (token.substr(0, 2) === '--') {
    token = token.substr(2)
  } else if (token.substr(0, 1) === '-') {
    token = token.substr(1)
    short = true
  } else {
    throw new Error('It is not an argument token.')
  }
  const equalPos = token.indexOf('=')
  let key
  let value = true
  if (equalPos != -1) {
    key = token.substr(0, equalPos)
    value = token.substr(equalPos + 1).trim()

    // Trim brackets.
    if (value > 1 && value[0] == value[value.length - 1] && BRACKETS.indexOf(value[0]) != -1) {
      value = value.substr(1, value.length - 2)
    }
  }
  else {
    key = token
    value = true
  }

  value = value instanceof String ? replaceSecretSpaces(value) : value

  return {
    key,
    value,
    short
  }
}

export function extractValue (args, key, defaultVal=null) {
  if (!(args instanceof Array)) {
    return defaultVal
  }
  const arg = args
    .filter(arg => arg.key === key)
  if (arg.length === 0) {
    return defaultVal
  } else if (arg.length == 1) {
    return arg[0].value
  }

  return arg.map(arg => arg.value)
}

export function parse (str) {
  const tokens = stringToTokens(str)

  return tokensToCommand(tokens)
}
