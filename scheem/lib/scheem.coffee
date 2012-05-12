Parser = require("./scheem-parser").parser
ScheemError = require("./scheem/error")
print = require("./scheem/print")
_ = require("underscore")

Guard =
  getClass: (object) ->
    Object::toString.call(object).match(/^\[object\s(.*)\]$/)[1]

  expect: (cond, message) ->
    throw new ScheemError(message) unless cond
    Guard

  expectCount: (count, params) ->
    Guard.expect params.length is count, "" + params.length + " params found where " + count + " expected."

  expectMinCount: (count, params) ->
    Guard.expect params.length >= count, "" + params.length + " params found where at least " + count + " expected."

  expectMaxCount: (count, params) ->
    Guard.expect params.length <= count, "" + params.length + " params found where no more than " + count + " expected."

  expectList: (thing) ->
    thingClass = Guard.getClass(thing)
    Guard.expect thingClass is "Array", thingClass + " found where a list was expected."

isA = (type) ->
  (expr) ->
    typeof expr is type
isNumber = isA("number")
isString = isA("string")
isFunction = isA("function")

lookup = (env, sym) ->
  if env.bindings[sym]?
    env.bindings[sym]
  else if env.outer?
    lookup(env.outer, sym)
  else
    throw new ScheemError("Reference to uninitialized var #{sym}.")

define = (env, sym, val) ->
  if env.bindings[sym]?
    throw new ScheemError("Attempt to reinitialize already initialized var #{sym}.")
  else
    env.bindings[sym] = val

update = (env, sym, val) ->
  if env.bindings[sym]?
    env.bindings[sym] = val
    null
  else if env.outer?
    update(env.outer, sym, val)
  else
    throw new ScheemError("Attempt to update uninitialized var #{sym}.")

bool = (bool) ->
  (if bool then "#t" else "#f")

map = (fn, coll) ->
  fn(thing) for thing in coll

reduce = (fn, coll) ->
  acc = coll[0]
  for thing in coll[1..]
    acc = fn(acc, thing)
  acc

forms =
  begin: (expr, env) ->
    result = evalAST(subexpr, env) for subexpr in expr[1..]
    result

  quote: (expr, env) ->
    Guard.expectCount 1, expr[1..]
    expr[1]

  if: (expr, env) ->
    Guard.expectMinCount(2, expr[1..]).expectMaxCount 3, expr[1..]
    if evalAST(expr[1], env) isnt "#f"
      evalAST expr[2], env
    else if expr[3]?
      evalAST expr[3], env

  let: (expr, env) ->
    Guard.expectMinCount(2, expr[1..])

    assignments = expr[1]
    Guard.expect () ->
      _.isArray(assignments) and assignments.length % 2 is 0
    , "let requires a list of even length for bindings."
    bindings = {}
    for x in [0...assignments.length] by 2
      bindings[assignments[x]] = assignments[x + 1]
    env =
      bindings: bindings
      outer: env
    result = evalAST(subexpr, env) for subexpr in expr[2..]
    result

  lambda: (expr, env) ->
    _vars = expr[1]
    _body = expr[2..]
    (_args...) ->
      bindings = {}

      for [_var, _arg] in _.zip(_vars, _args)
        bindings[_var] = _arg
      env =
        bindings: bindings
        outer: env
      result = evalAST(subexpr, env) for subexpr in _body
      result

  define: (expr, env) ->
    Guard.expectCount 2, expr[1..]
    define(env, expr[1], evalAST(expr[2], env))

  "set!": (expr, env) ->
    Guard.expectCount 2, expr[1..]
    update(env, expr[1], evalAST(expr[2], env))

primitives =
  "alert": (args...) ->
    if window.alert?
      alert(args.join(", "))
    else
      primitives.puts(args...)

  "puts": (args...) ->
    for arg in args
      console.log(arg)

  "length": (args...) ->
    Guard.expectCount 1, args
    args[0].length

  "empty?": (args...) ->
    Guard.expectCount 1, args
    bool(args[0].length is 0)

  "+": (args...) ->
    Guard.expectMinCount 1, args
    reduce (acc, n) ->
      acc + n
    , args

  "-": (args...) ->
    Guard.expectMinCount 1, args
    if args.length is 1
      0 - args[0]
    else
      reduce (acc, n) ->
        acc - n
      , args

  "*": (args...) ->
    Guard.expectMinCount 2, args
    reduce (acc, n) ->
      acc * n
    , args

  "/": (args...) ->
    Guard.expectMinCount 2, args
    reduce (acc, n) ->
      acc / n
    , args

  "=": (args...) ->
    Guard.expectCount 2, args
    bool(args[0] is args[1])

  "<": (args...) ->
    Guard.expectCount 2, args
    bool(args[0] < args[1])

  "<=": (args...) ->
    Guard.expectCount 2, args
    bool(args[0] <= args[1])

  ">": (args...) ->
    Guard.expectCount 2, args
    bool (args[0] > args[1])

  ">=": (args...) ->
    Guard.expectCount 2, args
    bool (args[0] >= args[1])

  cons: (args...) ->
    Guard.expectCount(2, args).expectList args[1]
    [args[0]].concat args[1]

  car: (args...) ->
    Guard.expectCount(1, args).expectList args[0]
    args[0][0]

  cdr: (args...) ->
    Guard.expectCount(1, args).expectList args[0]
    args[0][1..]

  list: (args...) ->
    args

initialEnv = () ->
  outer: null
  bindings: _.clone(primitives)

evalScheem = (code, env) ->
  env ?= initialEnv()
  try
    ast = Parser.parse(code)
    return evalAST(ast, env)
  catch e
    e.message = "Syntax error at line " + e.line + ", column " + e.column + "."  if e instanceof Parser.SyntaxError
    throw e

evalAST = (expr, env) ->
  if isNumber(expr)
    expr
  else if isString(expr)
    lookup(env, expr)
  else if forms[expr[0]]?
    forms[expr[0]](expr, env)
  else
    fn = evalAST(expr[0], env)
    args = (evalAST(arg, env) for arg in expr[1..])
    fn(args...)

module.exports =
  Error: ScheemError
  Parser: Parser
  print: print
  evalScheem: evalScheem