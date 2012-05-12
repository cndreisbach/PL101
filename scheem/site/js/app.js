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
      editor.setValue(code);
      editor.focus();
      var lineCount = editor.lineCount();
      for (var i = 0; i < lineCount; i++) {
        editor.indentLine(i);
      }
    };

    $('.example-link').click(function (e) {
      e.preventDefault();
      var code = $("#" + $(this).prop('rel')).text().replace(/^\s*|\s*$/, "");
      addToEditor(code);
    });
  });
})(jQuery);
