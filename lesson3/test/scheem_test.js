var PEG = require('pegjs')
var should = require('should')
var fs = require('fs')

var data = fs.readFileSync('scheem.peg', 'utf-8')
var parse = PEG.buildParser(data).parse;

describe('The Scheem parser', function() {
  it('should parse simple lists', function() {
    parse("(a b c)").should.eql([["a", "b", "c"]]);
  });

  it('should parse nested lists', function() {
    parse("(a (b c))").should.eql([["a", ["b", "c"]]]);
  });

  it('should handle any amount of whitespace', function() {
    parse("  ( def x ( lambda (  x  )  ( + 1    x)))   ").should.eql(
      [["def", "x", ["lambda", ["x"], ["+", "1", "x"]]]]
    );
  });

  it('should handle newlines and tabs', function() {
    parse("(def x\n\t(lambda (x) (+ 1 x)))\n").should.eql(
      [["def", "x", ["lambda", ["x"], ["+", "1", "x"]]]]
    )
  });

  it('should handle quoted forms', function() {
    parse("'(1 2 3)").should.eql(parse("(quote (1 2 3))"));
  });

  it("should parse multiple forms", function() {
    parse("(def double (lambda (x) (* x 2)))\n\n(double 4)").should.eql(
      [ ["def", "double", ["lambda", ["x"], ["*", "x", "2"]]],
        ["double", "4"] ]
    );
  });

  it("should discard comments", function() {
    parse("(def double (lambda (x) (* x 2)))\n\n;; should be 8\n(double 4)").should.eql(
      [ ["def", "double", ["lambda", ["x"], ["*", "x", "2"]]],
        ["double", "4"] ]
    );
  });

  it("should handle inline comments", function() {
    parse("(+ 1 1) ;; is 2").should.eql(
      [["+", "1", "1"]]
    )
  });
});

