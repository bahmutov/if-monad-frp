const f = () => console.log('it is true')
const g = () => console.log('nope')
const condition = true

import xs from 'xstream'

var s$ = xs.of(condition, !condition)
var truthy$ = s$.filter(c => c)
var falsy$ = s$.filter(c => !c)

truthy$.addListener({
  next: f
})
falsy$.addListener({
  next: g
})
