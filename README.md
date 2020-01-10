# Console command manager
[![Build Status](https://travis-ci.org/vlikin/console.svg?branch=master)](https://travis-ci.org/vlikin/console)
[![Coverage Status](https://coveralls.io/repos/github/vlikin/console/badge.svg?branch=master)](https://coveralls.io/github/vlikin/console?branch=master)

[![NPM](https://nodei.co/npm/console.png?downloads=true&downloadRank=true)](https://nodei.co/npm/console/)
[![NPM](https://nodei.co/npm-dl/console.png?months=9&height=3)](https://nodei.co/npm/console/)

It manages console commands. It uses own string parser that can be used independently.
## Command pattern.
```
--longArg1="arg1" -shortArg="arg1" -flag command value1 valuen
```
## Conventions
* Tokens can be disordered. They are ordered this way - arguments first, than command tokens.
* Tokens are separated into arguments and command name with values.
* Command name is the first, others are values of the command.
* Attention. Wrap values into double brackets.

## It parses a command string
```
const ccm = require('console-command-manager')

const inputString = '--longArg1="arg1" -shortArg="arg1" -flag command value1 valuen'
const command = ccm.parse(inputString)
console.dir(command)
```
It produces the following output.
```
{
  token: 'command',
  name: 'command',
  group: 'default',
  values: [ 'value1', 'valuen' ],
  args: [
    { key: 'longArg1', value: 'arg1', short: false },
    { key: 'shortArg', value: 'arg1', short: true },
    { key: 'flag', value: true, short: true }
  ]
}
```
For a workable example look at [parser.js](./example/parser.js)

## Console command manager implementation
Define dependencies.
```
const ccm = require('console-command-manager')
const readline = require('readline')
```
Define commands.
```
// Command definitions.
const commands = [

  // Exit command.
  {
    name: 'exit',
    group: 'default', // @todo refactore...
    title: 'It terminates the application.',
    handler: (command) => {
      console.log('See you.')

      // To break the input cycle return false.
      return Promise.resolve(false)
    }
  },

  // Print command.
  {
    name: 'print',
    title: 'Letter print command.',
    description: 'This is a command of the printer that allows to print something on a sheet.',
    group: 'MFP',
    arguments: [
      {
        key: '--format',
        description: 'The format of a printing letter.'
      },
      {
        key: '--orientation',
        description: 'Paper orientation.'
      }
    ],
    handler: (command) => {
      console.dir(command)
      console.log(command.name + ' has been processed.')

      return Promise.resolve(true)
    }
  }
]
```
Implement the command loop.
```
// Registers commands.
const locator = ccm.register(commands)

// Readline streams.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('line', async (input) => {
  // Cycled command processing.
  const command = ccm.parse(input)
  const toContinue = await ccm.executeCommand(locator, command)

  // If termination signal is received the readline stream is closed. The application is closed.
  if (!toContinue) {
    rl.close()
  }
})
```
For a workable example look at [mfd.js](./example/mfd.js)

##Contribution
You are free to make your contribution and help the library to be better. Follow on [contribution](./CONTRIBUTION.md)
and make your piece. 
