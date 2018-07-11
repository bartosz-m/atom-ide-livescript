var LanguageServer, path, fsExtra, fuzzysort, SourceMapConsumer, CompletionContext, BuildInClassProvider, OperatorProvider, ImportProvider, connection, documents, activeContext, CompletionItemKind, SymbolKind, livescript, lexer, Compiler, ref$, type, parent, transformEsm, livescriptTransformImplicitAsync, compiler, lastValid, symbols, Code, inCodeName, startsWithUpperCase, toDashCase, analyzeAst, safeCall, safeDelay, compileCode, verify, settings, workspaceRoot, clamp, builtInTypes, KEYWORDS_SHARED, KEYWORDS_UNUSED, JS_KEYWORDS, LS_KEYWORDS, keywords, providers, nodeDebugInfo, nodeDebugParents, nodeLocation, symbolProvider, e, message, toString$ = {}.toString, slice$ = [].slice, arrayFrom$ = Array.from || function(x){return slice$.call(x);};
LanguageServer = require('vscode-languageserver');
path = require('path');
fsExtra = require('fs-extra');
fuzzysort = require('fuzzysort');
SourceMapConsumer = require('source-map').SourceMapConsumer;
CompletionContext = require('./CompletionContext');
BuildInClassProvider = require('./providers/BuildInClassProvider');
OperatorProvider = require('./providers/OperatorProvider');
ImportProvider = require('./providers/ImportProvider');
connection = LanguageServer.createConnection();
process.on('uncaughtException', function(it){
  connection.console.log(it);
});
process.on('unhandledRejection', function(it){
  connection.console.log(it);
});
documents = new LanguageServer.TextDocuments();
documents.listen(connection);
activeContext = {};
CompletionItemKind = LanguageServer.CompletionItemKind, SymbolKind = LanguageServer.SymbolKind;
try {
  livescript = require('livescript');
  lexer = require('livescript/lib/lexer');
  Compiler = require('livescript-compiler/lib/livescript/Compiler');
  ref$ = require('livescript-compiler/lib/livescript/ast/symbols'), type = ref$.type, parent = ref$.parent;
  transformEsm = require('livescript-transform-esm/lib/plugin');
  livescriptTransformImplicitAsync = require('livescript-transform-implicit-async');
  compiler = Compiler.create({
    livescript: (ref$ = clone$(livescript), ref$.lexer = lexer, ref$)
  });
  transformEsm.install(compiler);
  livescriptTransformImplicitAsync.install(compiler);
  lastValid = {};
  symbols = {};
  Code = Symbol['for']('code.ast.livescript');
  inCodeName = Symbol['for']('name.ast.livescript');
  startsWithUpperCase = /^[A-Z]\s*/;
  toDashCase = function(it){
    if (startsWithUpperCase.test(it)) {
      return it;
    } else {
      return it.replace(/(?:^|\.?)([A-Z]+)/g, function(x, y){
        switch (false) {
        case y.length !== 1:
          return "-" + y.toLowerCase();
        default:
          return '-' + y;
        }
      }).replace(/^-/, "");
    }
  };
  analyzeAst = function(arg$){
    var ast, code, lines, walk, e, ref$;
    ast = arg$.ast, code = arg$.code;
    try {
      lines = code.split('\n');
      symbols[ast.filename] = {
        variables: []
      };
      walk = function(node){
        var ref$;
        if (node[type] === 'Var') {
          node[Code] = node.line != null ? lines[node.line - 1]
            ? lines[node.line - 1].substring(node.first_column, node.last_column).trim()
            : (connection.console.error("Analyzing error no line at index(" + node.line + ") in " + ast.filename), connection.console.error(((ref$ = node[parent]) != null ? ref$[type] : void 8) + " -> " + node.value), node[Code] = '') : "";
          node[inCodeName] = node[Code].match(/\-/)
            ? toDashCase(node.value)
            : node.value;
          symbols[ast.filename].variables.push(node);
        }
      };
      ast.traverseChildren(walk, true);
    } catch (e$) {
      e = e$;
      connection.console.error("Analyzing error " + ast.filename + ": " + ((ref$ = e.stack) != null
        ? ref$
        : e.message));
    }
  };
  safeCall = function(fn){
    return function(){
      var e, ref$;
      try {
        return fn.apply(this, arguments);
      } catch (e$) {
        e = e$;
        return connection.console.error("Error: " + ((ref$ = e.stack) != null
          ? ref$
          : e.message));
      }
    };
  };
  safeDelay = function(t, fn){
    return setTimeout(safeCall(fn), t);
  };
  compileCode = function(uri, code){
    var defaultOptions, options, ast, valid, x$, jsResult, y$, e, diagnostics, m, ref$;
    try {
      defaultOptions = {
        map: 'linked'
      };
      options = {
        filename: uri
      };
      ast = compiler.generateAst(code, import$(options, defaultOptions));
      if (!(valid = lastValid[uri])) {
        valid = lastValid[uri] = {};
      }
      valid.ast = ast;
      safeDelay(10, function(){
        return analyzeAst({
          ast: ast,
          code: code
        });
      });
      x$ = jsResult = compiler.compileAst({
        ast: ast,
        code: code,
        options: options
      });
      x$.sourceMap = x$.map.toJSON();
      y$ = (valid.map = jsResult.map, valid);
      y$.generatedCode = jsResult.code;
      y$.originalCode = code;
      y$.sourceMap = new SourceMapConsumer(jsResult.sourceMap);
      connection.sendDiagnostics({
        uri: uri,
        diagnostics: []
      });
    } catch (e$) {
      e = e$;
      diagnostics = [];
      try {
        if (!e.hash) {
          if (m = e.message.match(/.*at ([^:]+)\:([^\s]+) in/)) {
            e.hash = {
              loc: {
                first_line: m[1] - 1,
                first_column: m[2],
                last_line: m[1] - 1,
                last_column: m[2]
              }
            };
          } else if (m = e.message.match(/.*on line (\d+)/)) {
            e.hash = {
              loc: {
                first_line: m[1] - 1,
                first_column: 0,
                last_line: {
                  first_line: m[1] - 1
                },
                last_column: 0
              }
            };
          } else {
            e.hash = {
              loc: {
                first_line: 0,
                first_column: 0,
                last_line: 0,
                last_column: 0
              }
            };
          }
        }
        diagnostics.push({
          range: {
            start: {
              line: e.hash.loc.first_line,
              character: e.hash.loc.first_column
            },
            end: {
              line: e.hash.loc.last_line,
              character: e.hash.loc.last_column
            }
          },
          severity: 1,
          code: 0,
          message: e.message,
          source: 'LiveScript'
        });
      } catch (e$) {
        e = e$;
        connection.console.log((ref$ = e.stack) != null
          ? ref$
          : e.message);
      }
      connection.sendDiagnostics({
        uri: uri,
        diagnostics: diagnostics
      });
    }
  };
  verify = function(uri, code){
    compileCode(uri, code);
  };
  settings = {
    style: 'standard'
  };
  connection.onInitialize(function(params){
    workspaceRoot = params.rootUri;
    return {
      capabilities: {
        textDocumentSync: documents.syncKind,
        completionProvider: {
          resolveProvider: true
        },
        hoverProvider: true,
        documentSymbolProvider: true
      }
    };
  });
  connection.onRequest('compile', function(arg$){
    var uri, code, options, defaultOptions, ast, valid, x$, jsResult, e;
    uri = arg$.uri, code = arg$.code, options = arg$.options;
    try {
      if (uri) {
        code = documents.get(uri).getText();
      }
      defaultOptions = {
        map: 'linked'
      };
      options = {
        filename: uri
      };
      ast = compiler.generateAst(code, import$(options, defaultOptions));
      if (!(valid = lastValid[uri])) {
        valid = lastValid[uri] = {};
      }
      valid.ast = ast;
      x$ = jsResult = compiler.compileAst({
        ast: ast,
        code: code,
        options: options
      });
      x$.sourceMap = x$.map.toJSON();
      delete jsResult.ast;
      return jsResult;
    } catch (e$) {
      e = e$;
      return e;
    }
  });
  connection.onDidChangeConfiguration(function(change){
    var settings;
    settings = change.settings.standard;
    documents.all().forEach(diagnose);
  });
  documents.onDidChangeContent(function(change){
    activeContext.document = change.document;
    diagnose(change.document);
  });
  (ref$ = String.prototype).trimLeft == null && (ref$.trimLeft = function(){
    return this.replace.replace(/^\s+/, '');
  });
  clamp = function(value, min, max){
    if (value >= max) {
      return max;
    } else if (value <= min) {
      return min;
    } else {
      return value;
    }
  };
  builtInTypes = ['Boolean', 'Date', 'Error', 'EvalError', 'Function', 'Map', 'Number', 'Object', 'Promise', 'Proxy', 'Set', 'String', 'Symbol', 'WeakMap', 'WeakSet'];
  KEYWORDS_SHARED = ['true', 'false', 'null', 'this', 'void', 'super', 'return', 'throw', 'break', 'continue', 'if', 'else', 'for', 'while', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'function', 'class', 'extends', 'implements', 'new', 'do', 'delete', 'typeof', 'in', 'instanceof', 'let', 'with', 'var', 'const', 'import', 'export', 'debugger', 'yield', 'await'];
  KEYWORDS_UNUSED = ['enum', 'interface', 'package', 'private', 'protected', 'public', 'static'];
  JS_KEYWORDS = KEYWORDS_SHARED.concat(KEYWORDS_UNUSED);
  LS_KEYWORDS = ['xor', 'match', 'where'];
  keywords = LS_KEYWORDS.concat(JS_KEYWORDS);
  providers = {
    BuildInClassProvider: BuildInClassProvider,
    KeywordProvider: {
      keywords: {
        'class': {
          description: 'class declaration'
        }
      },
      getInformations: function(arg$){
        var label, keyword;
        label = arg$.label;
        if (keyword = this.keywords[label]) {
          return {
            detail: keyword.description
          };
        } else {
          return {};
        }
      }
    },
    OperatorProvider: OperatorProvider
  };
  connection.onCompletion(function(context){
    var result, completionContext, scoredKeywords, s, id, variableNames, sorted, variableHints, types, e, this$ = this;
    result = [];
    try {
      completionContext = CompletionContext.create({
        document: documents.get(context.textDocument.uri),
        position: context.position
      });
      scoredKeywords = fuzzysort.go(completionContext.prefix, keywords);
      result.push.apply(result, scoredKeywords.map(function(it){
        return {
          score: it.score,
          label: it.target,
          kind: CompletionItemKind.Keyword,
          data: {
            provider: "KeywordProvider"
          }
        };
      }));
      result.push.apply(result, providers.OperatorProvider.getSuggestions(completionContext));
      if (s = symbols[completionContext.document.uri]) {
        id = 0;
        variableNames = Array.from(new Set(s.variables.map(function(it){
          return it[inCodeName];
        })));
        sorted = fuzzysort.go(completionContext.prefix, variableNames);
        variableHints = sorted.slice(0, 4).map(function(it){
          return {
            score: it.score,
            label: it.target,
            kind: CompletionItemKind.Variable,
            data: {
              id: id++,
              provider: "VariableProvider"
            }
          };
        });
        result.push.apply(result, variableHints);
      }
      if (completionContext.isInsideImport()) {
        result.push.apply(result, ImportProvider.provideCompletion(completionContext));
      }
      if (completionContext.isInsideNew()) {
        types = fuzzysort.go(completionContext.prefix, builtInTypes);
        result.push.apply(result, types.map(function(it){
          return {
            score: it.score,
            label: it.target,
            kind: CompletionItemKind.Constructor,
            data: {
              provider: "BuildInConstructorProvider"
            }
          };
        }));
      } else {
        types = fuzzysort.go(completionContext.prefix, builtInTypes);
        result.push.apply(result, types.map(function(it){
          return {
            score: it.score,
            label: it.target,
            kind: CompletionItemKind.Class,
            data: {
              provider: "BuildInClassProvider"
            }
          };
        }));
      }
      result.sort(function(a, b){
        if (a.score <= b.score) {
          return 1;
        } else if (a.score >= b.score) {
          return -1;
        } else {
          return 0;
        }
      });
      result;
    } catch (e$) {
      e = e$;
      connection.console.log(e.message + "\n" + e.stack);
    }
    return result;
  });
  connection.onCompletionResolve(function(item){
    var providerName, ref$, provider, e;
    try {
      if (providerName = (ref$ = item.data) != null ? ref$.provider : void 8) {
        if (provider = providers[providerName]) {
          import$(item, provider.getInformations(item));
        }
      }
    } catch (e$) {
      e = e$;
      connection.console.error(e.message);
    }
    return item;
  });
  nodeDebugInfo = function(node){
    var result, k, v, access, that, own$ = {}.hasOwnProperty;
    result = [];
    for (k in node) if (own$.call(node, k)) {
      v = node[k];
      access = Object.hasOwnProperty.call(node, k) ? '.' : '::';
      result.push((fn$()));
    }
    return result;
    function fn$(){
      var ref$;
      switch (that = toString$.call(v).slice(8, -1)) {
      case 'Object':
        return access + "" + k + " : [" + ((ref$ = v[type]) != null ? ref$ : 'Object') + "]";
      case 'Array':
        return access + "" + k + " : [Array]";
      case 'Function':
        return access + "" + k + " : [Function]";
      default:
        return access + "" + k + " : " + that + " = " + v;
      }
    }
  };
  nodeDebugParents = function(node){
    var parents, p;
    parents = [];
    while (p = node[parent]) {
      parents.push(p[type]);
      node = p;
    }
    return parents.reverse().join('->');
  };
  connection.onHover(function(arg$, span){
    var position, textDocument, valid, ast, first_line, first_column, last_column, last_line, nodeOnLine, maxLineLength, vposition, nodeRange, hoverPosition, findOnLine, best, smallest, i$, len$, node, range, contents, operator, x$, ref$, ref1$, e;
    position = arg$.position, textDocument = arg$.textDocument;
    try {
      if ((valid = lastValid[textDocument.uri]) && (ast = valid.ast)) {
        position.line += 1;
        first_line = ast.first_line;
        first_column = ast.first_column, last_column = ast.last_column;
        last_line = ast.last_line;
        nodeOnLine = [];
        maxLineLength = 1000;
        vposition = function(line, character){
          return line * maxLineLength + character;
        };
        nodeRange = function(node){
          var x$;
          x$ = {};
          x$.start = vposition(node.first_line, node.first_column);
          x$.end = vposition(node.last_line, node.last_column);
          x$.size = x$.end - x$.start;
          return x$;
        };
        hoverPosition = vposition(position.line, position.character);
        findOnLine = function(node){
          var range;
          range = nodeRange(node);
          if (range.start <= hoverPosition && hoverPosition < range.end) {
            nodeOnLine.push(node);
          }
        };
        ast.traverseChildren(findOnLine, true);
        (ast.exports || (ast.exports = [])).forEach(function(it){
          findOnLine(it);
          return it.traverseChildren(findOnLine, true);
        });
        (ast.imports || (ast.imports = [])).forEach(function(it){
          findOnLine(it);
          return it.traverseChildren(findOnLine, true);
        });
        best = nodeOnLine[nodeOnLine.length - 1];
        smallest = nodeRange(best);
        for (i$ = 0, len$ = nodeOnLine.length; i$ < len$; ++i$) {
          node = nodeOnLine[i$];
          range = nodeRange(node);
          if (range.size < smallest) {
            smallest = range.size;
            best = node;
          }
        }
        contents = (operator = providers.OperatorProvider.operators[best.op])
          ? (x$ = [], operator.detail && x$.push(operator.detail), operator.documentation && x$.push(operator.documentation), operator.example && x$.push(operator.example), x$)
          : [nodeDebugParents(best) + ".**" + best[type] + "**"].concat(arrayFrom$(nodeDebugInfo(best)));
        return {
          contents: contents,
          range: {
            start: {
              line: best.first_line - 1,
              character: (ref$ = best.first_column) < (ref1$ = position.character) ? ref$ : ref1$
            },
            end: {
              line: best.last_line - 1,
              character: (ref$ = best.last_column) > (ref1$ = position.character) ? ref$ : ref1$
            }
          }
        };
      } else {
        return {
          contents: ["position " + position.line + ", " + position.character, "nothing"]
        };
      }
    } catch (e$) {
      e = e$;
      return {
        contents: ["error", e.message + "", e.stack + ""]
      };
    }
  });
  nodeLocation = function(node){
    var ref$;
    return {
      range: {
        start: {
          line: ((ref$ = node.first_line) != null
            ? ref$
            : node.line) - 1,
          character: (ref$ = node.first_column) != null
            ? ref$
            : node.column
        },
        end: {
          line: ((ref$ = node.last_line) != null
            ? ref$
            : node.line) - 1,
          character: (ref$ = node.last_column) != null
            ? ref$
            : node.column
        }
      }
    };
  };
  symbolProvider = {
    'Var': function(node){
      return {
        name: node.value,
        kind: SymbolKind.Variable,
        location: nodeLocation(node)
      };
    }
  };
  connection.onDocumentSymbol(function(arg$){
    var textDocument, result, valid, ast, walk, e, ref$;
    textDocument = arg$.textDocument;
    result = [];
    try {
      if ((valid = lastValid[textDocument.uri]) && (ast = valid.ast)) {
        walk = function(node, parent){
          var provider, x$, symbol;
          if (provider = symbolProvider[node[type]]) {
            x$ = symbol = provider(node, parent);
            x$.location.uri = textDocument.uri;
            result.push(symbol);
          }
        };
        ast.traverseChildren(walk, true);
      }
    } catch (e$) {
      e = e$;
      connection.console.log((ref$ = e.stack) != null
        ? ref$
        : e.message);
    }
    return result;
  });
} catch (e$) {
  e = e$;
  message = (function(){
    var ref$;
    try {
      return "Error: " + ((ref$ = e.stack) != null
        ? ref$
        : e.message);
    } catch (e$) {}
  }());
  connection.console.error("Error: " + message);
}
function diagnose(textDocument){
  var uri, text;
  uri = textDocument.uri;
  text = textDocument.getText();
  return verify(uri, text);
}
connection.listen();
function clone$(it){
  function fun(){} fun.prototype = it;
  return new fun;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
//# sourceMappingURL=server.js.map
