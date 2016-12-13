// plain JS if-else example
const condition = true
if (condition) {
  console.log('it is true')
} else {
  console.log('nope')
}

// separate condition check from "consequences"
const f = () => console.log('it is true')
const g = () => console.log('nope')
if (condition) {
  f()
} else {
  g()
}
