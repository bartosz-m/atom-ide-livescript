require! {
    \path
    \fs
    \fuzzysort
    'vscode-languageserver' : LanguageServer
}

const { CompletionItemKind, SymbolKind } = LanguageServer

module.exports = ImportProvider =
    provide-completion: (context) ->
        filepath = context.document.uri.match /file:\/\/(.*)/ ?.1
        if filepath
            import-prefix = path.basename context.prefix
            dirpath = path.dirname filepath
            module-path = context.prefix.replace /^[\\'"]/ '' 
            search-directory = path.normalize path.resolve (path.dirname filepath), module-path
            posible-modules = fs.readdir-sync search-directory
            modules = posible-modules
                .filter -> it != filepath and it.match /\.ls/
                .map -> it.replace '.ls' ''
            
          # modules = 
          # types = fuzzysort.go context.prefix, built-in-types
            modules.map ->
                score: 1
                label: it
                insert-text:
                  switch import-prefix.length
                  | 0 => '\\./' + it
                  | 1 => './' + it
                  | _ => it
                kind: CompletionItemKind.Module
            # sorted = fuzzysort.go import-prefix, modules
            # .map ->
            #     score: it.score
            #     label: it.target
            #     kind: CompletionItemKind.Class
        else
            []