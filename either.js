const Either = require('data.either')

const f = () => console.log('it is true')
const g = () => console.log('nope')
const condition = true

// separate condition
function truthyEither(c) {
  return c ? Either.Right() : Either.Left()
}

truthyEither(condition)
  .fold(g, f)

// don't need much logic if just "truthy" predicate
// but .fromNullable only looks at "null" and "undefined" values
// Either.fromNullable(condition)

// run more functions in "true" branch
const h = () => console.log('BREAKING NEWS!')
truthyEither(condition)
  .map(h)
  .fold(g, f)
