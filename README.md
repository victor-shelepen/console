# Console command manager
[![Build Status](https://travis-ci.org/vlikin/console.svg?branch=master)](https://travis-ci.org/vlikin/console)
[![Coverage Status](https://coveralls.io/repos/github/vlikin/console/badge.svg?branch=master)](https://coveralls.io/github/vlikin/console?branch=master)

[![NPM](https://nodei.co/npm/console-command-manager.png?downloads=true&downloadRank=true)](https://nodei.co/npm/console-command-manager/)
[![NPM](https://nodei.co/npm-dl/console-command-manager.png?months=9&height=3)](https://nodei.co/npm/console-command-manager/)

It run custom bash commands, is able to control your service from console like the think client does.

Be free and ask questings on [Gitter](https://gitter.im/vlikin/Lobby)
```javascript
(async function () {
  // const { runCommand } = require('console-command-manager') // @todo Uncomment at the real case.
  const { runCommand, extractValue } = require('../src/index')
  await runCommand(
    [
      {
        name: 'print',
        title: 'Prints values',
        handler: async ({request, injection: {console, DateFactory}}) => {
          const format = extractValue(request.args, 'format', 'not_set')
          console.log(`I am printing you text  ' ${request.values.join(' ')}  at ${new DateFactory()} ' format - ${format}`)

          return true
        }
      },
    ],
    {
      DateFactory: Date
    },
    process.argv.slice(2)
  )
})()
```
The command line
```bash
node ./example/commander.js print --format="A4" some text
```
Produces such lines
```bash
I am printing you text  ' some text  at Fri Mar 20 2020 18:11:19 GMT+0200 (Eastern European Standard Time) ' format - A4
```
For the full documentation read [WIKI](https://github.com/vlikin/console/wiki)

Main parts of the project:
* [String parser](https://github.com/vlikin/console/wiki/String-parser)
* [Command manager](https://github.com/vlikin/console/wiki/Command-manager)
* [Console runner](https://github.com/vlikin/console/wiki/Console-command-manager-implementation)

It manages commands, uses own string parser that can be used independently. Command handler could be asynchronous.
The code written by the library have to be testable.
