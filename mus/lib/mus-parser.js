var PEG = require('pegjs');
var fs = require('fs');
var muspeg = fs.readFileSync(__dirname + '/mus.pegjs', 'utf-8');
var parse = PEG.buildParser(muspeg).parse;

module.exports = {
  parse: function (mus) {
    return parse(mus);
  }
};
