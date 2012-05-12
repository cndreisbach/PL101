ScheemError = require("./error")
_ = require("underscore")

isArray = (thing) ->
  internalClass = Object.prototype.toString.call(thing).match(/\[object\s(\w+)\]/).toLowerCase()
  internalClass is "array"

print = (thing) ->
  switch typeof thing
    when "number" then thing.toString()
    when "string" then "'#{thing}"
    when "boolean"
      if thing then "#t" else "#f"
    when "object"
      if thing.length?
        "(list #{_(thing).map((x) -> print(x)).join(' ')})"
      else
        throw new ScheemError("I don't know how to print #{thing}.")
    else throw new ScheemError("I don't know how to print #{thing}.")

module.exports = print