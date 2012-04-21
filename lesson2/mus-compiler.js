var endTime = function (time, expr) {
    if (expr.tag == 'note') {
        return time + expr.dur;
    } else {
        var leftTime = endTime(0, expr.left);
        var rightTime = endTime(0, expr.right);
        if (expr.tag == 'par') {
            return time + Math.max(leftTime, rightTime);
        } else {
            return time + leftTime + rightTime;
        }
    }
};

var listNotes = function (time, expr) {
    if (expr.tag == 'note') {
        expr.start = time;
        return [expr];
    } else {
        var leftNotes = listNotes(time, expr.left);
        var rightNotes = [];
        if (expr.tag == 'par') {
            rightNotes = listNotes(time, expr.right);
        } else {
            rightNotes = listNotes(endTime(time, expr.left), expr.right);
        }
        return leftNotes.concat(rightNotes);
    }
};

var compile = function (musexpr) {
    console.log(listNotes(0, musexpr));
    return listNotes(0, musexpr);
};

