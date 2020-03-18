// const { parse } = require('console-command-manager') // @todo Uncomment at the real case.
const { parse } = require('../src/index')

const inputString = '--longArg1="arg1" -shortArg="arg1" -flag command value1 valuen'
const command = parse(inputString)
console.dir(command)
