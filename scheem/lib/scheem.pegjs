start =
  _ form:form
    { return form; }

form =
  atom / expression / quoted_expression
    
atom
  = number:number _ { return number; }
  / boolean:boolean _ { return boolean; }
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

