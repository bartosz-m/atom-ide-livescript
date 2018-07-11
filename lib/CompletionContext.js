var CompletionContext;
module.exports = CompletionContext = {
  init: function(arg$){
    var ref$;
    this.document = arg$.document, this.position = arg$.position;
    this.lines = this.document.getText().split('\n');
    this.line = this.lines[this.position.line];
    this.indent = this.line.match(/^\s*/)[0].length;
    this.toPosition = this.line.substring(0, this.position.character);
    this.before = this.toPosition.substring(0, this.toPosition.length - 1);
    this.text = this.toPosition.trimLeft();
    this.prefix = (ref$ = this.text.split(' '))[ref$.length - 1];
  },
  isInsideNew: function(){
    var re;
    re = /\s*new\s+/;
    return re.test(this.before);
  },
  isInsideImport: function(){
    var indent, lineChain, i$, i, line, lineIndent, len$;
    indent = this.indent;
    lineChain = [this.line];
    for (i$ = this.position.line - 1; i$ >= 0; --i$) {
      i = i$;
      line = this.lines[i];
      lineIndent = line.match(/^\s*/)[0].length;
      if (lineIndent < indent) {
        indent = lineIndent;
        lineChain.push(line);
      }
    }
    for (i$ = 0, len$ = lineChain.length; i$ < len$; ++i$) {
      line = lineChain[i$];
      if (line.trim().match(/\s*import(?: all)?(?:\s+|$)/)) {
        return true;
      }
    }
    return false;
  }
  /** checking if it is inside require */,
  isInsideRequire: function(){
    var stringLiterals, rOr, ws, id, s, stringLiteral, koniecPliku, any, objLit, ds, destruct, imp, simpleRequire, macroRequire, scopeLines, currentLine, lastIndent, rIndent, line, indent, requires;
    stringLiterals = ["'[^'\\n]+'", '"[^"\\n]+"', "\\\\[^\\\\\"'\\n]+"];
    rOr = function(){
      var x, res$, i$, to$;
      res$ = [];
      for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      x = res$;
      return "(?>" + x.join('|') + ")";
    };
    ws = "(?>\\s+)";
    id = "\\w+";
    s = stringLiteral = "\\s*" + rOr.apply(null, stringLiterals) + "\\s*";
    koniecPliku = "\\Z";
    any = "[a-zA-Z\\n]";
    objLit = "{(?:" + ws + "?" + id + ",?)+}";
    ds = destruct = ":" + ws + "?(?:" + id + "|" + objLit + ")";
    imp = s + "(?:" + ds + ")?";
    simpleRequire = new OnigRegExp("require" + ws + koniecPliku);
    macroRequire = new OnigRegExp("require!" + ws + "?{" + koniecPliku);
    scopeLines = [];
    currentLine = this.position.row;
    lastIndent = 100000000;
    rIndent = /^\s*/;
    do {
      line = this.edytor.getBuffer().lineForRow(currentLine);
      indent = line.match(rIndent)[0].length;
      if (indent < lastIndent) {
        lastIndent = indent;
        scopeLines.push(line);
      }
      currentLine = this.edytor.getBuffer().previousNonBlankRow(currentLine);
    } while (currentLine != null && lastIndent !== 0);
    if (!simpleRequire.testSync(this.prefix)) {
      requires = scopeLines.filter(function(it){
        return macroRequire.testSync(it);
      });
      return requires.length > 0;
    } else {
      return true;
    }
  },
  create: function(){
    var x$;
    x$ = Object.create(this);
    x$.init.apply(x$, arguments);
    return x$;
  }
};
//# sourceMappingURL=CompletionContext.js.map
