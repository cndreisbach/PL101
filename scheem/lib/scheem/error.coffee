class ScheemError
  constructor: (@message, @lineno) ->
    @name = "ScheemError"
  toString: ->
    "#{@name}: #{@message}"

module.exports = ScheemError