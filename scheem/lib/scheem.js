var PEG = require('pegjs')
var fs = require('fs')

var data = fs.readFileSync(__dirname + '/scheem.pegjs', 'utf-8')
var parse = PEG.buildParser(data).parse;

var evalAST = function (expr, env) {
  // Numbers evaluate to themselves
  if (typeof expr === 'number') {
    return expr;
  }
  // Strings are variable references
  if (typeof expr === 'string') {
    return env[expr];
  }
  // Look at head of list for operation
  switch (expr[0]) {
  case '+':
    return evalScheem(expr[1], env) +
      evalScheem(expr[2], env);
  case '-':
    return evalScheem(expr[1], env) -
      evalScheem(expr[2], env);
  case '*':
    return evalScheem(expr[1], env) *
      evalScheem(expr[2], env);
  case '/':
    return evalScheem(expr[1], env) /
      evalScheem(expr[2], env);
  case 'define':
  case 'set!':
    env[expr[1]] = evalScheem(expr[2], env);
    return 0;
  case 'begin':
    var i, result;
    for (i = 1; i < expr.length; i++) {
      result = evalScheem(expr[i], env);
    }
    return result;
  case 'quote':
    return expr[1];
  case '=':
    var eq =
      (evalScheem(expr[1], env) ===
       evalScheem(expr[2], env));
    if (eq) return '#t';
    return '#f';
  case '<':
    var lessThan =
      (evalScheem(expr[1], env) <
       evalScheem(expr[2], env))
    return lessThan ? '#t' : '#f';
  case 'cons':
    return [evalScheem(expr[1], env)].concat(evalScheem(expr[2], env));
  case 'car':
    return evalScheem(expr[1], env)[0];
  case 'cdr':
    return evalScheem(expr[1], env).slice(1);
  case 'if':            
    var cond = evalScheem(expr[1], env) == '#t';
    return cond ?
      evalScheem(expr[2], env) :
      evalScheem(expr[3], env);
  }
};

var evalScheemString = function(code, env) {
  if (env === undefined) {
    env = {};
  }

  var ast = parse(code);

  return evalAST(code, env);
};

module.exports = {
  parse: parse,
  eval: evalScheemString
};
