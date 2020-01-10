// const ccm = require('console-command-manager')
const ccm = require('../src/index')

const inputString = '--longArg1="arg1" -shortArg="arg1" -flag command value1 valuen'
const command = ccm.parse(inputString)
console.dir(command)
