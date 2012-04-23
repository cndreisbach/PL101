start =
  _ forms:form*
    { return forms; }

form =
  atom / expression / quoted_expression
    
atom =
  chars:valid_char+ _ 
    { return chars.join(""); }
        
expression =
  "(" _ forms:form+ ")" _
    { return forms; }

quoted_expression =
  "'" form:form
    { return ["quote", form]; }

valid_char = 
  [0-9a-zA-Z_?!+-=@#$%^&*/\.]

comment = 
  ";;" (!newline .)* 

newline =
  [\r\n]
    
space =
  [\t ]

_ =
  (newline / space / comment)*

