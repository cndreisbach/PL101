expect = require("chai").expect
should = require("chai").should()
Scheem = require("../lib/scheem")
evalScheem = Scheem.evalScheem
printScheem = Scheem.print

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
    expect(evalScheem("
      (begin
        (define a 23)
        (set! a 42)
        a)")).to.eql 42

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
    expect(evalScheem("(< 2 3)")).to.equal true
    expect(evalScheem("(= 7 3)")).to.equal false
    expect(evalScheem("(> 3 4)")).to.equal false
    expect(evalScheem("(>= 6 6)")).to.equal true

  it "should handle let", ->
    expect(evalScheem("
      (begin
        (define x 12)
        (let (x 7 y 21)
          (+ x y)))")).to.equal 28

  it "should handle function application", ->
    env =
      bindings:
        inc: (x) ->
          x + 1

      outer: null

    expect(evalScheem("(inc 2)", env)).to.equal 3

  it "should handle lambda definitions", ->
    expect(evalScheem("
      (begin
        (define inc (lambda (x) (+ x 1)))
        (inc 1))")).to.equal 2

    expect(evalScheem("
      (begin
        (define sum (lambda (x y) (+ x y)))
        (sum 2 3))")).to.equal 5



describe "lambda", ->
  it "should handle calling anonymous functions", ->
    expect(evalScheem("((lambda (x) (+ x x)) 27)")).to.equal 54

  it "should handle passing functions to functions", ->
    expect(evalScheem("
      (begin
        (define reduce (lambda (fn coll)
          (if (empty? coll)
            0
            (if (= (length coll) 1)
              (car coll)
              (fn (reduce fn (cdr coll)) (car coll))))))
        (define sum (lambda (x y) (+ x y)))
        (reduce sum '(1 2 3 4)))")).to.equal 10

  it "should be able to define reduce", ->
    expect(evalScheem("
      (begin
        (define square (lambda (x) (* x x)))
        (define map
          (lambda (fn coll)
            (if (empty? coll)
              '()
              (cons (fn (car coll)) (map fn (cdr coll))))))
        (map square '(1 2 3 4)))")).to.eql [1, 4, 9, 16]

  it "can shadow global vars", ->
    expect(evalScheem("(begin
                         (define x 10)
                         (define plus10 (lambda (x) (+ x 10)))
                         (plus10 1))")).to.equal 11

  it "can modify global vars", ->
    expect(evalScheem("(begin
                         (define x 0)
                         (define counter (lambda () (set! x (+ x 1)) x))
                         (counter)
                         (counter)
                         (counter))")).to.equal 3

  it "should handle recursion", ->
    expect(evalScheem("
    (begin
      (define factorial
        (lambda (n)
          (if (= n 0) 1 (* n (factorial (- n 1))))))
      (factorial 4))")).to.equal 24

describe "The printer", ->
  it "should print numbers as numbers", ->
    expect(printScheem(1)).to.eql "1"
    expect(printScheem(3.14)).to.eql "3.14"

  it "should print arrays as lists", ->
    expect(printScheem([1, 2, 3])).to.eql "(list 1 2 3)"

  it "should print true and false correctly", ->
    expect(printScheem(true)).to.eql "#t"
    expect(printScheem(false)).to.eql "#f"

  it "should print barewords as quoted symbols", ->
    expect(printScheem("test")).to.eql "'test"