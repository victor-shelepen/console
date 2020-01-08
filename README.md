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
### Conventions
* Tokens can be disordered. They are ordered this way - arguments first, than command tokens.
* Tokens are separated into arguments and command name with values.
* Command name is the first, others are values of the command.
* Attention. Wrap values into double brackets.

##Contribution
You are free to make your contribution and help the library to be better. Follow on [Contribution](./CONTRIBUTION.md)
and make your piece. 
