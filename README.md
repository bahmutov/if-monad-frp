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

Do we need the condition constructor function?

```js
function truthyEither(c) {
  return c ? Either.Right() : Either.Left()
}
```

Unfortunately we need this function.
The library only comes with a shortcut for creating
either `Right` or `Left` based on the argument being "null" or "undefined",
not "truthy" or "falsy".

```js
var o = ... // could be undefined or null
Either.fromNullable(o)
  .fold(invalidO, goodO)
```

## Ramda Fantasy Either monad

Another functional programming library
[Ramda Fantasy](https://github.com/ramda/ramda-fantasy) takes a different
approach to "extracting" values from the condition and running the success
and failure branches.

We construct the monad the same way, see [fantasy-either.js](fantasy-either.js)

```js
const Either = require('ramda-fantasy').Either

const f = () => console.log('it is true')
const g = () => console.log('nope')
const condition = true

// separate condition
function truthyEither(c) {
  return c ? Either.Right() : Either.Left()
}
```

But to actually execute "true" and "false" branches we need to use static
function `Either.either`.

```js
Either.either(g, f, truthyEither(condition))
// it is true
```

Notice that we passed the "left" function first, then the "right" one,
and then the monad instance itself. Why is it this way?

The `Either.either` function, just like all functions in
[Ramda](http://ramdajs.com/) library are curried, and with the order of
arguments strongly in favor of "data last". This is because we often know
the code to execute (our "true" and "false" branch callbacks) *before*
we get the condition monad. With curried `Either.either` we can write the
code like this, preparing *what to do* first and just waiting for data.

```js
const whatToDo = Either.either(g, f)
const cond = truthyEither(condition)
whatToDo(cond)
```

## Functional reactive programming

Everything changes when we try writing a program that models data flow
between event sources and sinks. Instead of handling a single condition
and executing "true" or "false" paths once, we must setup "pipelines" that
can execute multiple times.

To show this practice I will use a small reactive library
[xstream](https://github.com/staltz/xstream#readme). Since it a module
transpiled from TypeScript to ES6, I will use [babel-cli](https://babeljs.io/)
module to actually execute it.

```sh
npm i -D babel-cli babel-preset-es2015
echo '{"presets":["es2015"]}' > .babelrc
$(npm bin)/babel-node frp.js
```

First, we have same setup as before

```js
import xs from 'xstream'
const f = () => console.log('it is true')
const g = () => console.log('nope')
```

Instead of a single condition code, we have a *stream* of predicate events.
For example, we could have 3 events

```js
const s$ = xs.of(true, false, true)
```

Here is the most important difference between regular function programming
(rFP) and functional reactive programming (FRP): an `if-else` branch becomes
a fork in the events pipeline. One output "pipe" (or stream) can have
"truthy" events, while the other can have "falsy" events. In fact, it does not
have to be binary - you can have multiple "filters" and direct the event
into multiple output pathways, or even "clone" same event into multiple
output pathways.

For clarity I will create named streams for "truthy" events and for
"falsy" events. In our case they are disjoint, and an event is passed into
one of these stream depending on the predicate function passed to
`.filter` method.

```js
const truthy$ = s$.filter(c => c)
const falsy$ = s$.filter(c => !c)
```

Now we just need to start the events flowing, which we can do by adding
listeners to the above two streams.

```js
$(npm bin)/babel-node frp.js
it is true
it is true
nope
```

Note that the "truthy" stream runs immediately, because all the predicate
events are available immediately due to `xs.of(true, false, true)`.
In the real world situation, the events are usually generated via async
events, thus the order in which the streams `truthy$` and `falsy$`
execute are closer to the input events order.

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
