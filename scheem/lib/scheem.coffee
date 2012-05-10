Scheem = module.exports = {}
Scheem.Parser = Parser = require("./scheem-parser").parser

class ScheemError
  constructor: (@message, @lineno) ->
    @name = "ScheemError"
  toString: ->
    "#{@name}: #{@message}"

Scheem.Error = ScheemError
parse = Parser.parse

Scheem.evalScheem = evalScheem = (code, env) ->
  env ?= {}
  try
    ast = parse(code)
    return evalAST(ast, env)
  catch e
    e.message = "Syntax error at line " + e.line + ", column " + e.column + "."  if e instanceof Parser.SyntaxError
    throw e

isA = (type) ->
  (expr) ->
    typeof expr is type
isNumber = isA("number")
isString = isA("string")
isFunction = isA("function")

evalAST = (expr, env) ->
  if isNumber(expr)
    expr
  else if isString(expr)
    unless env[expr]?
      throw new ScheemError("Reference to uninitialized variable '" + expr + "'.")
    env[expr]
  else if isFunction(forms[expr[0]])
    forms[expr[0]](expr, env)
  else
    throw new ScheemError("Invalid expr: " + expr)

Guard =
  getClass: (object) ->
    Object::toString.call(object).match(/^\[object\s(.*)\]$/)[1]

  expect: (cond, message) ->
    throw new ScheemError(message)  unless cond
    Guard

  expectCount: (count, params) ->
    Guard.expect params.length is count + 1, "" + (params.length - 1) + " params found where " + count + " expected."

  expectMinCount: (count, params) ->
    Guard.expect params.length >= count + 1, "" + (params.length - 1) + " params found where at least " + count + " expected."

  expectMaxCount: (count, params) ->
    Guard.expect params.length <= count + 1, "" + (params.length - 1) + " params found where no more than " + count + " expected."

  expectList: (thing) ->
    thingClass = Guard.getClass(thing)
    Guard.expect thingClass is "Array", thingClass + " found where a list was expected."


bool = (bool) ->
  (if bool then "#t" else "#f")

map = (fn, coll) ->
  fn(thing) for thing in coll

reduce = (fn, coll) ->
  acc = coll[0]
  for thing in coll[1..]
    acc = fn(acc, thing)
  acc

mathReduce = (fn, coll, env) ->
  reduce fn, map((val) ->
    evalAST val, env
  , coll)

forms =
  begin: (expr, env) ->
    for subexpr in expr[1..]
      result = evalAST(subexpr, env)
    result

  quote: (expr, env) ->
    Guard.expectCount 1, expr
    expr[1]

  if: (expr, env) ->
    Guard.expectMinCount(2, expr).expectMaxCount 3, expr
    if evalAST(expr[1], env) isnt "#f"
      evalAST expr[2], env
    else if expr[3]?
      evalAST expr[3], env

  cons: (expr, env) ->
    Guard.expectCount(2, expr).expectList expr[2]
    [ evalAST(expr[1], env) ].concat evalAST(expr[2], env)

  car: (expr, env) ->
    Guard.expectCount 1, expr
    evalAST(expr[1], env)[0]

  cdr: (expr, env) ->
    Guard.expectCount 1, expr
    evalAST(expr[1], env).slice 1

  define: (expr, env) ->
    Guard.expectCount 2, expr
    if env[expr[1]]?
      throw new ScheemError("Cannot redefine existing vars. Try set! instead.")
    else
      env[expr[1]] = evalAST(expr[2], env)
      env[expr[1]]

  "set!": (expr, env) ->
    Guard.expectCount 2, expr
    if env[expr[1]]?
      env[expr[1]] = evalAST(expr[2], env)
      env[expr[1]]
    else
      throw new ScheemError("Must define a var before it can be redefined with set!.")

  "+": (expr, env) ->
    Guard.expectMinCount 1, expr
    mathReduce (acc, val) ->
      acc + val
    , expr.slice(1), env

  "-": (expr, env) ->
    Guard.expectMinCount 1, expr
    if expr.length is 2
      0 - evalAST(expr[1], env)
    else
      mathReduce (acc, val) ->
        acc - val
      , expr.slice(1), env

  "*": (expr, env) ->
    Guard.expectMinCount 2, expr
    mathReduce (acc, val) ->
      acc * val
    , expr.slice(1), env

  "/": (expr, env) ->
    Guard.expectMinCount 2, expr
    mathReduce (acc, val) ->
      acc / val
    , expr.slice(1), env

  "=": (expr, env) ->
    Guard.expectCount 2, expr
    bool (evalAST(expr[1], env) is evalAST(expr[2], env))

  "<": (expr, env) ->
    Guard.expectCount 2, expr
    bool (evalAST(expr[1], env) < evalAST(expr[2], env))

  "<=": (expr, env) ->
    Guard.expectCount 2, expr
    bool (evalAST(expr[1], env) <= evalAST(expr[2], env))

  ">": (expr, env) ->
    Guard.expectCount 2, expr
    bool (evalAST(expr[1], env) > evalAST(expr[2], env))

  ">=": (expr, env) ->
    Guard.expectCount 2, expr
    bool (evalAST(expr[1], env) >= evalAST(expr[2], env))