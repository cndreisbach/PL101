var Guard, Parser, Scheem, ScheemError, bool, evalAST, evalScheem, forms, isA, isFunction, isNumber, isString, map, mathReduce, parse, reduce;

Scheem = module.exports = {};

Scheem.Parser = Parser = require("./scheem-parser").parser;

ScheemError = (function() {

  ScheemError.name = 'ScheemError';

  function ScheemError(message, lineno) {
    this.message = message;
    this.lineno = lineno;
    this.name = "ScheemError";
  }

  ScheemError.prototype.toString = function() {
    return "" + this.name + ": " + this.message;
  };

  return ScheemError;

})();

Scheem.Error = ScheemError;

parse = Parser.parse;

Scheem.evalScheem = evalScheem = function(code, env) {
  var ast;
  if (env == null) {
    env = {};
  }
  try {
    ast = parse(code);
    return evalAST(ast, env);
  } catch (e) {
    if (e instanceof Parser.SyntaxError) {
      e.message = "Syntax error at line " + e.line + ", column " + e.column + ".";
    }
    throw e;
  }
};

isA = function(type) {
  return function(expr) {
    return typeof expr === type;
  };
};

isNumber = isA("number");

isString = isA("string");

isFunction = isA("function");

evalAST = function(expr, env) {
  if (isNumber(expr)) {
    return expr;
  } else if (isString(expr)) {
    if (env[expr] == null) {
      throw new ScheemError("Reference to uninitialized variable '" + expr + "'.");
    }
    return env[expr];
  } else if (isFunction(forms[expr[0]])) {
    return forms[expr[0]](expr, env);
  } else {
    throw new ScheemError("Invalid expr: " + expr);
  }
};

Guard = {
  getClass: function(object) {
    return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
  },
  expect: function(cond, message) {
    if (!cond) {
      throw new ScheemError(message);
    }
    return Guard;
  },
  expectCount: function(count, params) {
    return Guard.expect(params.length === count + 1, "" + (params.length - 1) + " params found where " + count + " expected.");
  },
  expectMinCount: function(count, params) {
    return Guard.expect(params.length >= count + 1, "" + (params.length - 1) + " params found where at least " + count + " expected.");
  },
  expectMaxCount: function(count, params) {
    return Guard.expect(params.length <= count + 1, "" + (params.length - 1) + " params found where no more than " + count + " expected.");
  },
  expectList: function(thing) {
    var thingClass;
    thingClass = Guard.getClass(thing);
    return Guard.expect(thingClass === "Array", thingClass + " found where a list was expected.");
  }
};

bool = function(bool) {
  if (bool) {
    return "#t";
  } else {
    return "#f";
  }
};

map = function(fn, coll) {
  var thing, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = coll.length; _i < _len; _i++) {
    thing = coll[_i];
    _results.push(fn(thing));
  }
  return _results;
};

reduce = function(fn, coll) {
  var acc, thing, _i, _len, _ref;
  acc = coll[0];
  _ref = coll.slice(1);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    thing = _ref[_i];
    acc = fn(acc, thing);
  }
  return acc;
};

mathReduce = function(fn, coll, env) {
  return reduce(fn, map(function(val) {
    return evalAST(val, env);
  }, coll));
};

forms = {
  begin: function(expr, env) {
    var result, subexpr, _i, _len, _ref;
    _ref = expr.slice(1);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subexpr = _ref[_i];
      result = evalAST(subexpr, env);
    }
    return result;
  },
  quote: function(expr, env) {
    Guard.expectCount(1, expr);
    return expr[1];
  },
  "if": function(expr, env) {
    Guard.expectMinCount(2, expr).expectMaxCount(3, expr);
    if (evalAST(expr[1], env) !== "#f") {
      return evalAST(expr[2], env);
    } else if (expr[3] != null) {
      return evalAST(expr[3], env);
    }
  },
  cons: function(expr, env) {
    Guard.expectCount(2, expr).expectList(expr[2]);
    return [evalAST(expr[1], env)].concat(evalAST(expr[2], env));
  },
  car: function(expr, env) {
    Guard.expectCount(1, expr);
    return evalAST(expr[1], env)[0];
  },
  cdr: function(expr, env) {
    Guard.expectCount(1, expr);
    return evalAST(expr[1], env).slice(1);
  },
  define: function(expr, env) {
    Guard.expectCount(2, expr);
    if (env[expr[1]] != null) {
      throw new ScheemError("Cannot redefine existing vars. Try set! instead.");
    } else {
      env[expr[1]] = evalAST(expr[2], env);
      return env[expr[1]];
    }
  },
  "set!": function(expr, env) {
    Guard.expectCount(2, expr);
    if (env[expr[1]] != null) {
      env[expr[1]] = evalAST(expr[2], env);
      return env[expr[1]];
    } else {
      throw new ScheemError("Must define a var before it can be redefined with set!.");
    }
  },
  "+": function(expr, env) {
    Guard.expectMinCount(1, expr);
    return mathReduce(function(acc, val) {
      return acc + val;
    }, expr.slice(1), env);
  },
  "-": function(expr, env) {
    Guard.expectMinCount(1, expr);
    if (expr.length === 2) {
      return 0 - evalAST(expr[1], env);
    } else {
      return mathReduce(function(acc, val) {
        return acc - val;
      }, expr.slice(1), env);
    }
  },
  "*": function(expr, env) {
    Guard.expectMinCount(2, expr);
    return mathReduce(function(acc, val) {
      return acc * val;
    }, expr.slice(1), env);
  },
  "/": function(expr, env) {
    Guard.expectMinCount(2, expr);
    return mathReduce(function(acc, val) {
      return acc / val;
    }, expr.slice(1), env);
  },
  "=": function(expr, env) {
    Guard.expectCount(2, expr);
    return bool(evalAST(expr[1], env) === evalAST(expr[2], env));
  },
  "<": function(expr, env) {
    Guard.expectCount(2, expr);
    return bool(evalAST(expr[1], env) < evalAST(expr[2], env));
  },
  "<=": function(expr, env) {
    Guard.expectCount(2, expr);
    return bool(evalAST(expr[1], env) <= evalAST(expr[2], env));
  },
  ">": function(expr, env) {
    Guard.expectCount(2, expr);
    return bool(evalAST(expr[1], env) > evalAST(expr[2], env));
  },
  ">=": function(expr, env) {
    Guard.expectCount(2, expr);
    return bool(evalAST(expr[1], env) >= evalAST(expr[2], env));
  }
};
