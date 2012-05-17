var should = require('chai').should();
var parse = require('../lib/scheem-parser').parser.parse;

describe('The Scheem parser', function() {
  it('should parse simple lists', function() {
    parse("(a b c)").should.eql(["a", "b", "c"]);
  });

  it('should parse nested lists', function() {
    parse("(a (b c))").should.eql(["a", ["b", "c"]]);
  });

  it('should handle any amount of whitespace', function() {
    parse("  ( def x ( lambda (  x  )  ( + 1    x)))   ").should.eql(
      ["def", "x", ["lambda", ["x"], ["+", 1, "x"]]]
    );
  });

  it('should handle newlines and tabs', function() {
    parse("(def x\n\t(lambda (x) (+ 1 x)))\n").should.eql(
      ["def", "x", ["lambda", ["x"], ["+", 1, "x"]]]
    )
  });

  it('should handle quoted forms', function() {
    parse("'(1 2 3)").should.eql(parse("(quote (1 2 3))"));
  });

  it("should discard comments", function() {
    parse("(begin (def double (lambda (x) (* x 2)))\n\n;; should be 8\n(double 4))").should.eql(
      ["begin",
       ["def", "double", ["lambda", ["x"], ["*", "x", 2]]],
       ["double", 4] ]
    );
  });

  it("should handle inline comments", function() {
    parse("(+ 1 1) ;; is 2").should.eql(
      ["+", 1, 1]
    )
  });

  it("should handle atoms with dashes", function() {
    parse("(test-word)").should.eql(["test-word"]);
  });

  it("should handle true and false", function() {
    parse("#t").should.eql(true);
    parse("#f").should.eql(false);
  });

  it("should handle negative numbers", function() {
    parse("-15").should.eql(-15);
  });

  it("should handle strings", function() {
    parse("\"hello world\"").should.eql("hello world");
  });

  it("should handle strings with embedded quotes", function() {
    parse("\"hello \\\"world\\\"\"").should.eql("hello \"world\"");
  });
});

