var Prefix;
module.exports = Prefix = {
  init: function(arg$){
    var ref$;
    this.document = arg$.document, this.position = arg$.position;
    this.lines = this.document.getText().split('\n');
    this.line = this.lines[this.position.line];
    this.toPosition = this.line.substring(0, this.position.character);
    this.before = this.toPosition.substring(0, this.toPosition.length - 1);
    this.text = this.toPosition.trimLeft();
    this.prefix = (ref$ = this.text.split(' '))[ref$.length - 1];
  },
  isInsideNew: function(){
    var re;
    re = /\s*new\s+/;
    return re.test(this.before);
  }
  /** sprawdza czy jest wewnątrz require */,
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
//# sourceMappingURL=Prefix.js.map