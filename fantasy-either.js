const Either = require('ramda-fantasy').Either

const f = () => console.log('it is true')
const g = () => console.log('nope')
const condition = true

// separate condition
function truthyEither(c) {
  return c ? Either.Right() : Either.Left()
}

// Either.either is curried
// so this is the same as
// Either.either(g, f, truthyEither(condition))
Either.either(g, f)(truthyEither(condition))

// separate WHAT to do from DATA
// for simple passing around and composition
const whatToDo = Either.either(g, f)
const cond = truthyEither(condition)
whatToDo(cond)
