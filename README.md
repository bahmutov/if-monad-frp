# if-vs-either-vs-frp

Examples of imperative if-else vs monad vs functional reactive

## Install

Clone this repo and install its dependencies

```sh
git clone git@github.com:bahmutov/if-monad-frp.git
cd if-monad-frp
npm install
```

## Goal

Given a simply predicate (true or false), execute first or second function.
We traditionally write imperative conditions using `if-else` operator

```js
const condition = true
if (condition) {
  console.log('it is true')
} else {
  console.log('nope')
}
```

While this is nice, it quickly becomes hard when the condition becomes
more complex, and the number of statements in "true" and "false" branches
grows. What can we do to change this?

## Imperative refactoring

We can separate the condition check from the code inside the "true" and
"false" branches. For example in [if.js](if.js) I have

```js
const condition = true
const f = () => console.log('it is true')
const g = () => console.log('nope')
// now execute the condition and one of the functions
if (condition) {
  f()
} else {
  g()
}
```

Good, but condition and the branches are still together. There is hard
to add more statements to `f` or `g` if we want to execute more code depending
on the condition. The actions of checking the predicate `condition` and
running `f()` or `g()` are too close and hard to extend with new functionality.

## Folktale Either monad

First, let us take [Either](https://github.com/folktale/data.either#readme)
monad from the large [Folktale](http://origamitower.github.io/folktale/folktale.html)
library. It wraps the condition inside and allows us to specify functions
to execute later. See the code in [either.js](either.js) that creates either
(get it?) `Either.Right` object if the predicate is true or `Either.Left`
object if the predicate is false.

```js
const Either = require('data.either')

const f = () => console.log('it is true')
const g = () => console.log('nope')
const condition = true

function truthyEither(c) {
  return c ? Either.Right() : Either.Left()
}

truthyEither(condition)
```

We only created an anonymous `Either` object, but how do we actually execute
our branches? We tell the `Either` instance using separate call.

```js
truthyEither(condition)
  .fold(g, f)
// it is true
```

Notice that the "false" branch function `g` is at the first position (that
is why it is called "Left"), while the "true" branch function `f` is the second.

```js
.fold(falseBranchFunction, trueBrunchFunction)
```

What if we want to run more functions in the "true" branch, which is common.
We can easily pass additional function as callbacks using `.map()` method.

```js
// run more functions in "true" branch
const h = () => console.log('BREAKING NEWS!')
truthyEither(condition)
  .map(h)
  .fold(g, f)
// BREAKING NEWS!
// it is true
```

### Small print

Author: Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt; &copy; 2016

* [@bahmutov](https://twitter.com/bahmutov)
* [glebbahmutov.com](https://glebbahmutov.com)
* [blog](https://glebbahmutov.com/blog)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/if-vs-either-vs-frp/issues) on Github

## MIT License

Copyright (c) 2016 Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
