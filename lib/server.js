var LanguageServer, livescript, fsExtra, path, lsAst, compile, compileCode, verify, connection, documents, CompletionItemKind, settings, workspaceRoot;
LanguageServer = require('vscode-languageserver');
livescript = require('livescript-async');
fsExtra = require('fs-extra');
path = require('path');
lsAst = function(code, options){
  var ast, filename, output, result;
  options == null && (options = {});
  ast = livescript.ast(code);
  filename = options.filename;
  output = ast.compileRoot(options);
  output.setFile(filename);
  return result = output.toStringWithSourceMap();
};
compile = async function(filepath){
  var lsCode, options, x$, jsResult, e;
  try {
    lsCode = (await fs.readFile(filepath, 'utf8'));
    options = {};
    x$ = jsResult = lsAst(lsCode, import$(options, defaultOptions));
    x$.sourceMap = x$.map.toJSON();
  } catch (e$) {
    e = e$;
    connection.console.error("Error: " + e.message);
  }
};
compileCode = function(uri, lsCode){
  var defaultOptions, options, x$, jsResult, e, diagnostics;
  try {
    defaultOptions = {};
    options = {
      filename: uri
    };
    x$ = jsResult = lsAst(lsCode, import$(options, defaultOptions));
    x$.sourceMap = x$.map.toJSON();
    connection.console.log("compiled " + uri);
    connection.sendDiagnostics({
      uri: uri,
      diagnostics: []
    });
  } catch (e$) {
    e = e$;
    connection.console.log(e);
    diagnostics = [{
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
    }];
    connection.sendDiagnostics({
      uri: uri,
      diagnostics: diagnostics
    });
  }
};
verify = function(uri, code){
  compileCode(uri, code);
};
connection = LanguageServer.createConnection();
documents = new LanguageServer.TextDocuments();
connection.console.log('Loading');
documents.listen(connection);
CompletionItemKind = LanguageServer.CompletionItemKind;
connection.console.log(LanguageServer);
connection.console.log(CompletionItemKind);
settings = {
  style: 'standard'
};
connection.onInitialize(function(params){
  connection.console.log('Initializing');
  workspaceRoot = params.rootUri;
  return {
    capabilities: {
      textDocumentSync: documents.syncKind
    }
  };
});
connection.onDidChangeConfiguration(function(change){
  var settings;
  settings = change.settings.standard;
  documents.all().forEach(diagnose);
});
documents.onDidChangeContent(function(change){
  diagnose(change.document);
});
connection.onCompletion(function(_textDocumentPosition){
  return [
    {
      label: 'TypeScript',
      kind: CompletionItemKind.Text,
      data: 1
    }, {
      label: 'JavaScript',
      kind: CompletionItemKind.Text,
      data: 2
    }
  ];
});
function diagnose(textDocument){
  var uri, text;
  uri = textDocument.uri;
  text = textDocument.getText();
  return verify(uri, text);
}
connection.console.log('listening');
connection.listen();
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
//# sourceMappingURL=/home/bartek/Projekty/atom/ide-livescript/lib/server.js.map
