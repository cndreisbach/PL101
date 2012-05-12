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
module.exports = ScheemError;