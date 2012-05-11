start =
  _ form:form
    { return form; }

form =
  atom / expression / quoted_expression
    
atom
  = number:number _ { return number; }
  / chars:valid_char+ _ { return chars.join(""); }
        
expression =
  "(" _ forms:form+ ")" _
    { return forms; }

quoted_expression =
  "'" form:form
    { return ["quote", form]; }

number
  = number:[0-9]+ { return parseInt(number.join("")); }
    
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

