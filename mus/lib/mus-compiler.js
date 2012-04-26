var clone = function (obj) {
  if (obj == null || typeof(obj) != 'object') {
    return obj;
  }
  var temp = new obj.constructor(); 
  for(var key in obj) {
    temp[key] = clone(obj[key]);
  }
  return temp;
}

var sectionLength = function (expr) {
  switch (expr.tag) {
  case 'repeat':
    return sectionLength(expr.section) * expr.count;
    break;
  case 'par':
    return Math.max(sectionLength(expr.left),
                    sectionLength(expr.right));
    break;
  case 'seq':
    return sectionLength(expr.left) + sectionLength(expr.right);
    break;
  default:
    return expr.dur;
  }
}

var endTime = function (time, expr) {
  return time + sectionLength(expr);
}

var listNotes = function (time, expr) {
  var i;
  switch (expr.tag) {
  case 'repeat':
    var notes = [];
    var len = sectionLength(expr.section);
    var offset = 0;
    for (i = 0; i < expr.count; i++) {
      notes = notes.concat(listNotes(time + offset, expr.section));
      offset += len;
    }
    return notes;
    break;
  case 'par':
  case 'seq':
    var leftNotes = listNotes(time, expr.left);
    var rightNotes = [];
    if (expr.tag == 'seq') {
      time = endTime(time, expr.left);
    }
    rightNotes = listNotes(time, expr.right);
    return leftNotes.concat(rightNotes);
    break;
  default:
    var newExpr = clone(expr);
    newExpr.start = time;
    return [newExpr];
  }
};

var musCompiler = module.exports = {
  compileToNote: function (expr) {
    return listNotes(0, expr);
  }
};
