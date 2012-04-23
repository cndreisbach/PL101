/* PEG for MUS language
 * Note syntax: pitch[dur]
 * Rest syntax: _[dur]
 * Seq syntax: note & note
 * Par syntax: note | note
 * Repeat syntax: note * times
 * Order of operations: *, |, &. Parentheses short-circuit this.
 */

start 
  = seq

seq
  = left:par _ "&" _ right:seq _ { return {tag: "seq", left: left, right: right}; }
  / par

par = 
  left:repeat _ "|" _ right:par _ { return {tag: "par", left: left, right: right}; }
  / repeat

repeat
  = primary:primary _ "*" _ times:number _ { return {tag: "repeat", times: times, repeat: primary}; }
  / primary

primary
  = (note / rest)
  / "(" _ seq:seq ")" _ { return seq; }

note
  = pitch:pitch "[" duration:number "]" _
  { return {tag: "note", pitch: pitch, duration: duration}; }

pitch
  = !"B#"i !"E#"i note:[A-G]i sharp:"#"? octave:octave?
  { return note.toUpperCase() + sharp + (octave || 4); }

octave =
  sign:"-"? number:number { return "" + sign + number; }

rest
  = "_" "[" duration:number "]" _ { return {tag: "rest", duration: duration}; } 

number
  = digits:[0-9]+ { return parseInt(digits.join("")); }
  
_
  = (whitespace / newline)*

whitespace
  = [ \t]

newline
  = [\r\n]
    