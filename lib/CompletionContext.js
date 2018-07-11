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
      if (line.trim().match(/\s*(?:import(?: all)?|require!)(?:\s+|$)|/)) {
        return true;
      }
    }
    return false;
  },
  create: function(){
    var x$;
    x$ = Object.create(this);
    x$.init.apply(x$, arguments);
    return x$;
  }
};
//# sourceMappingURL=CompletionContext.js.map
