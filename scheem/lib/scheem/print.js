ScheemError = require("./error");
_ = require("underscore");
isArray = function(thing) {
  var internalClass;
  internalClass = Object.prototype.toString.call(thing).match(/\[object\s(\w+)\]/).toLowerCase();
  return internalClass === "array";
};
print = function(thing) {
  switch (typeof thing) {
    case "number":
      return thing.toString();
    case "string":
      return "'" + thing;
    case "boolean":
      if (thing) {
        return "#t";
      } else {
        return "#f";
      }
      break;
    case "object":
      if (thing.length != null) {
        return "(list " + (_(thing).map(function(x) {
          return print(x);
        }).join(' ')) + ")";
      } else {
        throw new ScheemError("I don't know how to print " + thing + ".");
      }
      break;
    default:
      throw new ScheemError("I don't know how to print " + thing + ".");
  }
};
module.exports = print;