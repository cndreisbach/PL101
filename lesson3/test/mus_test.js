var PEG = require('pegjs');
var should = require('should');
var fs = require('fs');

var mus = fs.readFileSync('mus.pegjs', 'utf-8');
var parse = PEG.buildParser(mus).parse;

describe('The MUS parser', function() {
  it("should parse notes", function() {
    parse("a4[100]").should.eql({tag: "note", pitch: "A4", duration: 100});
  });
});
