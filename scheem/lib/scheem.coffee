Parser = require("./scheem-parser").parser
_ = require("underscore")

class ScheemError
  constructor: (@message, @lineno) ->
    @name = "ScheemError"
  toString: ->
    "#{@name}: #{@message}"

Guard =
  getClass: (object) ->
    Object::toString.call(object).match(/^\[object\s(.*)\]$/)[1]

  expect: (cond, message) ->
    throw new ScheemError(message)  unless cond
    Guard

  expectCount: (count, params) ->
    Guard.expect params.length is count, "" + (params.length - 1) + " params found where " + count + " expected."

  expectMinCount: (count, params) ->
    Guard.expect params.length >= count, "" + (params.length - 1) + " params found where at least " + count + " expected."

  expectMaxCount: (count, params) ->
    Guard.expect params.length <= count, "" + (params.length - 1) + " params found where no more than " + count + " expected."

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
    for subexpr in expr[1..]
      result = evalAST(subexpr, env)
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

  'let-one': (expr, env) ->
    bindings = {}
    bindings[expr[1]] = evalAST(expr[2], env)
    env =
      bindings: bindings,
      outer: env
    evalAST(expr[3], env)

  'lambda-one': (expr, env) ->
    _var = expr[1]
    _body = expr[2]
    (_arg) ->
      bindings = {}
      bindings[_var] = _arg
      env =
        bindings: bindings,
        outer: env
      evalAST(_body, env)

  cons: (expr, env) ->
    Guard.expectCount(2, expr[1..]).expectList expr[2]
    [ evalAST(expr[1], env) ].concat evalAST(expr[2], env)

  car: (expr, env) ->
    Guard.expectCount 1, expr[1..]
    evalAST(expr[1], env)[0]

  cdr: (expr, env) ->
    Guard.expectCount 1, expr[1..]
    evalAST(expr[1], env).slice 1

  define: (expr, env) ->
    Guard.expectCount 2, expr[1..]
    define(env, expr[1], evalAST(expr[2], env))

  "set!": (expr, env) ->
    Guard.expectCount 2, expr[1..]
    update(env, expr[1], evalAST(expr[2], env))

  "=": (expr, env) ->
    Guard.expectCount 2, expr[1..]
    bool (evalAST(expr[1], env) is evalAST(expr[2], env))

  "<": (expr, env) ->
    Guard.expectCount 2, expr[1..]
    bool (evalAST(expr[1], env) < evalAST(expr[2], env))

  "<=": (expr, env) ->
    Guard.expectCount 2, expr[1..]
    bool (evalAST(expr[1], env) <= evalAST(expr[2], env))

  ">": (expr, env) ->
    Guard.expectCount 2, expr[1..]
    bool (evalAST(expr[1], env) > evalAST(expr[2], env))

  ">=": (expr, env) ->
    Guard.expectCount 2, expr[1..]
    bool (evalAST(expr[1], env) >= evalAST(expr[2], env))

primitives =
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
  evalScheem: evalScheem