(async function() {
  // const { runCLI } = require('console-command-manager') // @todo Uncomment at the real case.
  const { runCLI, extractValue } = require('../src/index')

  runCLI('Hello!', [
    {
      name: 'print',
      title: 'Prints values',
      handler: async ({request, injection: { console, DateFactory } }) => {
        const format = extractValue(request.args, 'format', 'not_set')
        console.log(`I am printing you text  ' ${request.values.join(' ')}  at ${new DateFactory()} ' format - ${format}`)
      }
    },
  ],
    {
      DateFactory: Date
    })
})()
