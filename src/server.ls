require! {
    'vscode-languageserver' : LanguageServer
    'livescript-async' : livescript
    'fs-extra'
    'path': path
}

ls-ast = (code, options = {}) ->
      ast = livescript.ast code
      {filename} = options
      output = ast.compile-root options
      output.set-file filename
      result = output.to-string-with-source-map!

compile = (filepath) !->>
    try
        ls-code = await fs.read-file filepath, \utf8
        options = {}
        js-result = ls-ast ls-code, options <<< default-options
            ..source-map = ..map.to-JSON!
            # ..code += "\n//# sourceMappingURL=#map-file\n"
        # fs.output-file output, js-result.code
        # fs.output-file map-file, JSON.stringify js-result.map.to-JSON!
    catch
        connection.console.error "Error: #{e.message}"

compile-code = (uri, ls-code) !->
    try

        default-options = {}
        options =
            filename: uri
        js-result = ls-ast ls-code, options <<< default-options
            ..source-map = ..map.to-JSON!
        connection.console.log "compiled #{uri}"
            # ..code += "\n//# sourceMappingURL=#map-file\n"
        # fs.output-file output, js-result.code
        # fs.output-file map-file, JSON.stringify js-result.map.to-JSON!
        connection.sendDiagnostics {uri, diagnostics:[] }
    catch
        connection.console.log e
        diagnostics = [
            range:
                start:
                    line: e.hash.loc.first_line
                    character: e.hash.loc.first_column
                end:
                    line: e.hash.loc.last_line
                    character: e.hash.loc.last_column
            # ESLint uses 2 for errors and 1 for warnings. LSP uses the opposite 2 warnings 1 for errors.
            severity: 1
            code: 0 #message.ruleId,
            message: e.message
            source: \LiveScript
        ]

        connection.sendDiagnostics {uri, diagnostics}

verify = (uri, code) !->
    compile-code uri, code



const connection = LanguageServer.createConnection!
const documents = new LanguageServer.TextDocuments!
connection.console.log 'Loading'
documents.listen connection

{ CompletionItemKind } = LanguageServer
connection.console.log LanguageServer
connection.console.log CompletionItemKind


settings = style: 'standard'

var workspaceRoot

connection.on-initialize (params) ->
    connection.console.log 'Initializing'
    workspaceRoot := params.rootUri
    capabilities:
        textDocumentSync: documents.syncKind
        # completionProvider:
        #     resolveProvider: true


connection.on-did-change-configuration (change) !->
    settings = change.settings.standard

    documents.all!forEach diagnose

documents.onDidChangeContent (change) !->
    diagnose change.document

connection.onCompletion (_textDocumentPosition) ->
	# The pass parameter contains the position of the text document in
	# which code complete got requested. For the example we ignore this
	# info and always provide the same completion items.
    [
        {
            label: 'TypeScript',
            kind: CompletionItemKind.Text,
            data: 1
        },
        {
            label: 'JavaScript',
            kind: CompletionItemKind.Text,
            data: 2
        }
    ]

function diagnose textDocument
    const uri = textDocument.uri
    const text = textDocument.getText()
    verify uri, text


connection.console.log 'listening'
connection.listen!
