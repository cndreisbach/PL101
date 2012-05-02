var PEG = require('pegjs')
var fs = require('fs')

var data = fs.readFileSync(__dirname + '/scheem.pegjs', 'utf-8')
var parse = PEG.buildParser(data).parse;

var ScheemError = function(message, lineno) {
  this.name = "ScheemError";
  this.message = message;
  this.lineno = lineno;
};

ScheemError.prototype.toString = function() {
  return this.name + ': "' + this.message + '"';
};


var guard = {
  getClass: function(object) {
    return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
  },
  
  expect: function(cond, message) {
    if (!cond) {
      throw new ScheemError(message);
    }
    return guard;
  },
  
  expectCount: function(count, params) {
    return guard.expect(params.length == count + 1,
                        "" + (params.length - 1) + " params found where " + count + " expected.");
  },
  
  expectMinCount: function(count, params) {
    return guard.expect(params.length >= count + 1,
                        "" + (params.length - 1) + " params found where at least " + count + " expected.");
  },
  
  expectMaxCount: function(count, params) {
    return guard.expect(params.length <= count + 1,
                        "" + (params.length - 1) + " params found where no more than " + count + " expected.");
  },
  
  expectList: function(thing) {
    var thingClass = guard.getClass(thing);
    return guard.expect(thingClass === 'Array',
                        thingClass + " found where a list was expected.");
  }
};

var bool = function(bool) {
  return bool ? '#t' : '#f';
}

var forms = {
  // Base forms
  begin: function(expr, env) {
    var i, result;
    for (i = 1; i < expr.length; i++) {
      result = evalScheem(expr[i], env);
    }
    return result;
  },
  quote: function(expr, env) {
    guard.expectCount(1, expr);
    return expr[1];
  },
  if: function(expr, env) {
    guard.expectMinCount(2, expr).expectMaxCount(3, expr);
    if (evalScheem(expr[1], env) !== '#f') {
      return evalScheem(expr[2], env);
    } else {
      if (typeof expr[3] === "undefined") {
        return;
      } else {
        return evalScheem(expr[3], env);
      }
    }
  },
  
  // List manipulation
  cons: function(expr, env) {
    guard.expectCount(2, expr).expectList(expr[2]);
    return [evalScheem(expr[1], env)].concat(evalScheem(expr[2], env));
  },
  car: function(expr, env) {
    guard.expectCount(1, expr);
    return evalScheem(expr[1], env)[0];
  },
  cdr: function(expr, env) {
    guard.expectCount(1, expr);
    return evalScheem(expr[1], env).slice(1);
  },
  
  // Variable handling
  define: function(expr, env) {
    if (typeof env[expr[1]] === "undefined") {
      env[expr[1]] = evalScheem(expr[2], env);
      return env[expr[1]];
    } else {
      throw new ScheemError("Cannot redefine existing vars. Try set! instead.");
    }
  },
  'set!': function(expr, env) {
    if (typeof env[expr[1]] !== "undefined") {
      env[expr[1]] = evalScheem(expr[2], env);
      return env[expr[1]];
    } else {
      throw new ScheemError("Must define a var before it can be redefined with set!.");
    }
  },

  // Math
  '+': function(expr, env) {
    return evalScheem(expr[1], env) + evalScheem(expr[2], env);
  },
  '-': function(expr, env) {
    return evalScheem(expr[1], env) - evalScheem(expr[2], env);
  },
  '*': function(expr, env) {
    return evalScheem(expr[1], env) * evalScheem(expr[2], env);
  },
  '/': function(expr, env) {
    return evalScheem(expr[1], env) / evalScheem(expr[2], env);
  },
  '=': function(expr, env) {
    return bool((evalScheem(expr[1], env) === evalScheem(expr[2], env)));
  },
  '<': function(expr, env) {
    return bool((evalScheem(expr[1], env) < evalScheem(expr[2], env)));
  },
  '<=': function(expr, env) {
    return bool((evalScheem(expr[1], env) <= evalScheem(expr[2], env)));
  },
  '>': function(expr, env) {
    return bool((evalScheem(expr[1], env) > evalScheem(expr[2], env)));
  },
  '>=': function(expr, env) {
    return bool((evalScheem(expr[1], env) >= evalScheem(expr[2], env)));
  }
};


var evalScheem = function(expr, env) {
  // Numbers evaluate to themselves
  if (typeof expr === 'number') {
    return expr;
  }
  // Strings are variable references
  if (typeof expr === 'string') {
    return env[expr];
  }
  if (typeof forms[expr[0]] === 'function') {
    return forms[expr[0]](expr, env);
  }

  throw new ScheemError("Invalid expr: " + expr);
};

var evalScheemString = function(code, env) {
  if (typeof env === 'undefined') {
    env = {};
  }

  var ast = parse(code);
  return evalScheem(ast, env);
};

module.exports = {
  parse: parse,
  eval: evalScheemString,
  Error: ScheemError
};
