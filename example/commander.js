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
        }
      },
    ],
    {
      DateFactory: Date
    },
    process.argv.slice(2)
  )
})()
