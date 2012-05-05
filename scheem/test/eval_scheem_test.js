var expect = require('chai').expect;
var should = require('chai').should();
var evalScheem = require("../lib/scheem").evalScheem;

describe("The Scheem interpreter", function() {
  it("should evaluate blocks using begin", function() {
    expect(evalScheem("(begin (define a 2) (+ 2 a))")).to.equal(4);
  });
  
  it("should quote forms", function() {
    expect(evalScheem("(quote a)")).to.equal("a");
    expect(evalScheem("(quote (1 2 3))")).to.eql([1, 2, 3]);
  });
  
  it("should only expect one argument to quote", function() {
    expect(function() { evalScheem("(quote 1 2)") }).to.throw();
  });
  
  it("should evaluate if forms", function() {
    expect(evalScheem("(if (= 1 1) 1 0)")).to.equal(1);
    expect(evalScheem("(if (= 1 0) 1 0)")).to.equal(0);
  });
  
  it("should handle if forms with only one branch", function() {
    expect(evalScheem("(if (= 1 1) 1)")).to.equal(1);
    expect(evalScheem("(if (= 1 0) 1)")).to.be.a('undefined');
  });
  
  it("should have only two or three arguments to if", function() {
    expect(function() { evalScheem("(if (= 1 1))") }).to.throw();
    expect(function() { evalScheem("(if (= 1 1) 1 2 3)") }).to.throw();
  });
  
  it("should evaluate cons forms", function() {
    expect(evalScheem("(cons 1 '(2 3 4))")).to.eql([1, 2, 3, 4]);
  });
  
  it("should have only two arguments to cons", function() {
    expect(function() { evalScheem("(cons 1)") }).to.throw();
    expect(function() { evalScheem("(cons 1 '(2 3 4) '(5 6))") }).to.throw();
  });
  
  it("should have a list as the second argument to cons", function() {
    expect(function() { evalScheem("(cons 1 2)") }).to.throw();
  });
  
  it("should evaluate car forms", function() {
    expect(evalScheem("(car '(1 2 3))")).to.equal(1);
  });
  
  it("should have only one argument to car", function() {
    expect(function() { evalScheem("(car)") }).to.throw();
    expect(function() { evalScheem("(car '(2 3 4) '(5 6))") }).to.throw();
  });
  
  it("should evaluate cdr forms", function() {
    expect(evalScheem("(cdr '(1 2 3))")).to.eql([2, 3]);
  });
  
  it("should have only one argument to cdr", function() {
    expect(function() { evalScheem("(cdr)") }).to.throw();
    expect(function() { evalScheem("(cdr '(2 3 4) '(5 6))") }).to.throw();
  });
  
  it("should allow for var definition", function (){
    expect(evalScheem("(begin (define a 23) a)")).to.eql(23);
  });

  it("should not allow for var redefinition with define", function() {
    expect(function() { evalScheem("(begin (define a 23) (define a 32))") }).to.throw();
  });
  
  it("should allow for var redefinition with set!", function() {
    expect(evalScheem("(begin (define a 23) (set! a 42) a)")).to.eql(42);
  });

  it("should not allow for var initialization with set!", function() {
    expect(function () { evalScheem("(begin (set! a 42))") }).to.throw();
  });

  it("should throw an error when using an uninitialized var", function() {
    expect(function () { evalScheem("(+ a 1)").to.throw(); });
  });
  
  it("should interpret simple math", function() {
    expect(evalScheem("(+ 2 3)")).to.equal(5);
    expect(evalScheem("(- 7 3)")).to.equal(4);
    expect(evalScheem("(* 3 4)")).to.equal(12);
    expect(evalScheem("(/ 6 2)")).to.equal(3);
  });

  it("should interpret variadic math", function() {
    expect(evalScheem("(+ 1 2 3 4)")).to.equal(10);
    expect(evalScheem("(- 10 5 6)")).to.equal(-1);
    expect(evalScheem("(* 10 10 5)")).to.equal(500);
    expect(evalScheem("(/ 27 9 3)")).to.equal(1);
  });

  it("should handle unary minus", function() {
    expect(evalScheem("(- 3)")).to.equal(-3);
  });

  it("should evaluate math conditionals", function() {
    expect(evalScheem("(< 2 3)")).to.equal("#t");
    expect(evalScheem("(= 7 3)")).to.equal("#f");
    expect(evalScheem("(> 3 4)")).to.equal("#f");
    expect(evalScheem("(>= 6 6)")).to.equal("#t");
  });
});


