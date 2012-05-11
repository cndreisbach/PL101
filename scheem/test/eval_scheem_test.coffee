expect = require("chai").expect
should = require("chai").should()
evalScheem = require("../lib/scheem").evalScheem

describe "The Scheem interpreter", ->
  it "should evaluate blocks using begin", ->
    expect(evalScheem("(begin (define a 2) (+ 2 a))")).to.equal 4

  it "should quote forms", ->
    expect(evalScheem("(quote a)")).to.equal "a"
    expect(evalScheem("(quote (1 2 3))")).to.eql [ 1, 2, 3 ]

  it "should only expect one argument to quote", ->
    expect(->
      evalScheem "(quote 1 2)"
    ).to.throw()

  it "should evaluate if forms", ->
    expect(evalScheem("(if (= 1 1) 1 0)")).to.equal 1
    expect(evalScheem("(if (= 1 0) 1 0)")).to.equal 0

  it "should handle if forms with only one branch", ->
    expect(evalScheem("(if (= 1 1) 1)")).to.equal 1
    expect(evalScheem("(if (= 1 0) 1)")).to.be.a "undefined"

  it "should create a new scope for let-one", ->
    expect(evalScheem("(begin (define x 1) (let-one x 2 x))")).to.equal 2
    expect(evalScheem("(begin (define x 1) (let-one x 2 (= x 2)) x)")).to.equal 1

  it "should have only two or three arguments to if", ->
    expect(->
      evalScheem "(if (= 1 1))"
    ).to.throw()
    expect(->
      evalScheem "(if (= 1 1) 1 2 3)"
    ).to.throw()

  it "should evaluate cons forms", ->
    expect(evalScheem("(cons 1 '(2 3 4))")).to.eql [ 1, 2, 3, 4 ]

  it "should have only two arguments to cons", ->
    expect(->
      evalScheem "(cons 1)"
    ).to.throw()
    expect(->
      evalScheem "(cons 1 '(2 3 4) '(5 6))"
    ).to.throw()

  it "should have a list as the second argument to cons", ->
    expect(->
      evalScheem "(cons 1 2)"
    ).to.throw()

  it "should evaluate car forms", ->
    expect(evalScheem("(car '(1 2 3))")).to.equal 1

  it "should have only one argument to car", ->
    expect(->
      evalScheem "(car)"
    ).to.throw()
    expect(->
      evalScheem "(car '(2 3 4) '(5 6))"
    ).to.throw()

  it "should evaluate cdr forms", ->
    expect(evalScheem("(cdr '(1 2 3))")).to.eql [ 2, 3 ]

  it "should have only one argument to cdr", ->
    expect(->
      evalScheem "(cdr)"
    ).to.throw()
    expect(->
      evalScheem "(cdr '(2 3 4) '(5 6))"
    ).to.throw()

  it "should allow for var definition", ->
    expect(evalScheem("(begin (define a 23) a)")).to.eql 23

  it "should not allow for var redefinition with define", ->
    expect(->
      evalScheem "(begin (define a 23) (define a 32))"
    ).to.throw()

  it "should allow for var redefinition with set!", ->
    expect(evalScheem("(begin (define a 23) (set! a 42) a)")).to.eql 42

  it "should not allow for var initialization with set!", ->
    expect(->
      evalScheem "(begin (set! a 42))"
    ).to.throw()

  it "should throw an error when using an uninitialized var", ->
    expect ->
      evalScheem("(+ a 1)").to.throw()

  it "should interpret simple math", ->
    expect(evalScheem("(+ 2 3)")).to.equal 5
    expect(evalScheem("(- 7 3)")).to.equal 4
    expect(evalScheem("(* 3 4)")).to.equal 12
    expect(evalScheem("(/ 6 2)")).to.equal 3

  it "should interpret variadic math", ->
    expect(evalScheem("(+ 1 2 3 4)")).to.equal 10
    expect(evalScheem("(- 10 5 6)")).to.equal -1
    expect(evalScheem("(* 10 10 5)")).to.equal 500
    expect(evalScheem("(/ 27 9 3)")).to.equal 1

  it "should handle unary minus", ->
    expect(evalScheem("(- 3)")).to.equal -3

  it "should evaluate math conditionals", ->
    expect(evalScheem("(< 2 3)")).to.equal "#t"
    expect(evalScheem("(= 7 3)")).to.equal "#f"
    expect(evalScheem("(> 3 4)")).to.equal "#f"
    expect(evalScheem("(>= 6 6)")).to.equal "#t"

  it "should handle function application", ->
    env =
      bindings:
        inc: (x) ->
          x + 1

      outer: null

    expect(evalScheem("(inc 2)", env)).to.equal 3

  it "should handle lambda-one definition", ->
    expect(evalScheem("(begin (define inc (lambda-one x (+ x 1))) (inc 1))")).to.equal 2

  it "should handle recursion", ->
    expect(evalScheem("(begin (define factorial (lambda-one n (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 4))")).to.equal 24