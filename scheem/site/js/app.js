(function($) {
  var evaluateCode = function evaluateCode(editor) {
    var code = editor.getValue();

    try {
      var result = scheem.evalScheem(code);
      $('#results').addClass('alert-success').removeClass('alert-error').html(result || "nil");
    } catch (e) {
      $('#results').addClass('alert-error').removeClass('alert-success').html(e.message);
      window.lastError = e;
    }
  };
  
  $(function () {
    var editor = CodeMirror.fromTextArea(document.getElementById('scheem-editor'), {
      mode: "scheme",
      theme: "elegant",
      lineNumbers: true,
      matchBrackets: true,
      autofocus: true,
      lineWrapping: true,
      onChange: evaluateCode
    });

    var addToEditor = function(code) {
      return function (e) {
        editor.setValue(code);
        editor.focus();
        var lineCount = editor.lineCount();
        for (var i = 0; i < lineCount; i++) {
          editor.indentLine(i);
        }
        e.preventDefault();
      };
    };
    
    $('#addition-example').click(addToEditor(";; All commands in Scheem start with a method, like + in this command. The arguments come afterward.\n(+ 3 4)"));
    $('#math-example').click(addToEditor(";; As you can see, we can send more than 2 arguments to any math command. Also note that because the operator always comes first (this is called prefix notation) we do not have to worry about arithmetic precedence.\n(/ (* 4 5 21)\n (+ 11 3)\n (- (+ 1 1) 4))"));
    $('#vars-example').click(addToEditor(";; The Scheem language can only support one command, or form, so if we want to execute multiple forms, we have to wrap the forms in a begin form.\n(begin\n;; define initializes a var to a value.\n(define a 12)\n(define b (* a 2))\n;; set! is used to set the value of an already initialized var.\n(set! a 8)\n(/ b a))"));
    $('#branching-example').click(addToEditor("(begin\n(define age 35)\n;; An if form in Scheem takes three arguments. The first is the predicate: a form that evaluates to true or false. The second form is executed if the predicate is true and the third form is executed if the predicate if false.\n(if (< age 30)\n-1\n;; if is one form, so it can be used to create the true or false branches of other if statements, creating a branching tree.\n(if (= age 30)\n0\n;; if does not require a false branch. If you do not include one and the predicate is false, nil is returned.\n(if (> age 30)\n1))))"));
  });
})(jQuery);
