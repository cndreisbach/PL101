start =
  _ form:form
    { return form; }

form =
  atom / expression / quoted_expression
    
atom
  = number:number _ { return number; }
  / boolean:boolean _ { return boolean; }
  / string:string _ { return string; }
  / chars:valid_char+ _ { return chars.join(""); }
        
expression =
  "(" _ forms:form* ")" _
    { return forms; }

quoted_expression =
  "'" form:form
    { return ["quote", form]; }

number
  = negative:'-'? number:[0-9]+ { return parseInt(negative + number.join("")); }

boolean
  = '#' tf:[tf] { return (tf == 't'); }

string
  = '"' string:string_char* '"' { return string.join(""); }

string_char
  = [^\\"]
  / "\\t" { return "\t"; }
  / "\\r" { return "\r"; }
  / "\\n" { return "\n"; }
  / "\\" char:. { return char; }
  
valid_char = 
  [0-9a-zA-Z_?!+><=@#$%^&*/\.\-]

comment = 
  ";;" (!newline .)* 

newline =
  [\r\n]
    
space =
  [\t ]

_ =
  (newline / space / comment)*

