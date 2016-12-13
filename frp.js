import xs from 'xstream'
const f = () => console.log('it is true')
const g = () => console.log('nope')

const s$ = xs.of(true, false, true)
const truthy$ = s$.filter(c => c)
const falsy$ = s$.filter(c => !c)

truthy$.addListener({
  next: f
})
falsy$.addListener({
  next: g
})
