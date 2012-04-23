var PEG = require('pegjs');
var should = require('should');
var fs = require('fs');

var mus = fs.readFileSync('mus.pegjs', 'utf-8');
var parse = PEG.buildParser(mus).parse;

describe('The MUS parser', function() {
  it("should parse notes", function() {
    parse("a4[100]").should.eql({tag: "note", pitch: "A4", duration: 100});
  });

  it("should parse sharp notes", function() {
    parse("C#3[50]").should.eql({tag: "note", pitch: "C#3", duration: 50});
  });
  
  it("should not parse non-existent notes", function() {
    (function () {
      parse("E#3[50]");
    }).should.throw();
    (function () {
      parse("H5[50]");
    }).should.throw();
  });

  it("should parse rests", function() {
    parse("_[50]").should.eql({tag: "rest", duration: 50});
  });

  it("should parse repeats", function() {
    parse("a4[100] * 3").should.eql({
      tag: "repeat",
      times: 3,
      repeat: {
        tag: "note",
        pitch: "A4",
        duration: 100
      }
    });
  });

  it("should parse sequences", function() {
    parse("a4[100] & c4[100]").should.eql(
      { tag: "seq",
        left: {
          tag: "note",
          pitch: "A4",
          duration: 100
        },
        right: {
          tag: "note",
          pitch: "C4",
          duration: 100
        }
      }
    );
  });

  it("should parse parallel notes", function() {
    parse("a4[100] | c4[100]").should.eql({
      tag: "par",
      left: { tag: "note", pitch: "A4", duration: 100 },
      right: { tag: "note", pitch: "C4", duration: 100 }
    });
  });

  it("should parse nested sequences", function() {
    parse("a4[100] & _[100] & d4[100]").should.eql({
      tag: "seq",
      left: { tag: "note", pitch: "A4", duration: 100 },
      right: {
        tag: "seq",
        left: { tag: "rest", duration: 100 },
        right: { tag: "note", pitch: "D4", duration: 100 }
      }
    });
  });

  it("should bind parallels tighter than sequences", function() {
    parse("e4[100] & a4[100] | d4[100] & e4[100]").should.eql({
      tag: "seq",
      left: { tag: "note", pitch: "E4", duration: 100 },
      right: {
        tag: "seq",
        left: {
          tag: "par",
          left: { tag: "note", pitch: "A4", duration: 100 },
          right: { tag: "note", pitch: "D4", duration: 100 }
        },
        right: { tag: "note", pitch: "E4", duration: 100 }
      }
    });
  });

  it("should bind parentheses tighter than parallels", function() {
    parse("(e4[100] & a4[100]) | d4[100] & e4[100]").should.eql({
      tag: "seq",
      left: {
        tag: "par",
        left: {
          tag: "seq",
          left: { tag: "note", pitch: "E4", duration: 100 },
          right: { tag: "note", pitch: "A4", duration: 100 }
        },
        right: { tag: "note", pitch: "D4", duration: 100 }
      },
      right: { tag: "note", pitch: "E4", duration: 100 }
    });
  });
  
  it("should bind repeats tighter than parallels but lower than parentheses", function() {
    parse("(e4[50] & _[50]) * 3 | a4[150]").should.eql({
      tag: "par",
      left: {
        tag: "repeat",
        times: 3,
        repeat: {
          tag: "seq",
          left: { tag: "note", pitch: "E4", duration: 50 },
          right: { tag: "rest", duration: 50 }
        }
      },
      right: { tag: "note", pitch: "A4", duration: 150 }
    });
  });
});

