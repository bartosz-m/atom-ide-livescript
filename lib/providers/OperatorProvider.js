var fuzzysort, LanguageServer, CompletionItemKind, SymbolKind;
fuzzysort = require('fuzzysort');
LanguageServer = require('vscode-languageserver');
CompletionItemKind = LanguageServer.CompletionItemKind, SymbolKind = LanguageServer.SymbolKind;
module.exports = {
  operators: {
    '**': {
      detail: "power operator",
      documentation: "The power is right associative, and has higher precedence than unary ops. `^` is an alias for `**`",
      example: "```livescript\n    2 ** 4     #=> 16\n    -2 ^ 2 ^ 3 #=> -256\n```"
    },
    '.&.': {
      detail: "bitwise and",
      example: "```livescript\n    14 .&. 9   #=> 8\n```"
    },
    '==': {
      text: "~=",
      detail: 'Fuzzy equality (with type coercion)',
      example: "```livescript\n    2 ~= '2'       #=> true\n    \\1 !~= 1       #=> false\n```"
    },
    '>?': {
      detail: 'Maximum',
      example: "```livescript\n    4 >? 8     #=> 8\n```"
    },
    '<?': {
      detail: 'Minimum',
      example: "```livescript\n9 - 5 <? 6 #=> 4\n```"
    },
    'instanceof': {
      detail: 'Instanceof - list literals to the right get expanded',
      example: "```livescript\nnew Date() instanceof Date           #=> true\nnew Date() instanceof [Date, Object] #=> true\n```"
    },
    'classof': {
      text: 'typeof!',
      detail: 'Typeof - add a bang for a useful alternative',
      example: "```livescript\ntypeof /^/  #=> object\ntypeof! /^/ #=> RegExp\n```"
    }
  },
  getSuggestions: function(prefix){
    var operators, k, ref$, v, ref1$, scoredOperators;
    operators = [];
    for (k in ref$ = this.operators) {
      v = ref$[k];
      operators.push((ref1$ = v.text) != null ? ref1$ : k);
    }
    scoredOperators = fuzzysort.go(prefix.prefix, operators);
    return scoredOperators.map(function(it){
      return {
        score: it.score,
        label: it.target,
        kind: CompletionItemKind.Keyword,
        data: {
          provider: "OperatorProvider"
        }
      };
    });
  }
};
//# sourceMappingURL=providers/OperatorProvider.js.map
