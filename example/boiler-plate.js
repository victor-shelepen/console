(async function() {
  const { runCLI } = require('../src/cli')

  runCLI('Hello!', [
    {
      name: 'print',
      title: 'Prints values',
      handler: async ({request, injection: { console, DateFactory } }) => {
        console.log(`I am printing you - ${request.values.join(' --> ')} -  now at ${new DateFactory()}`)

        return true
      }
    },
  ],
    {
      DateFactory: Date
    })
})()
