require! {
    'fuzzysort'
    'vscode-languageserver' : LanguageServer
}

{ CompletionItemKind, SymbolKind } = LanguageServer

module.exports =
    # same order as on livescript.net
    operators: 
        '**' : 
            detail: "power operator"
            documentation: "The power is right associative, and has higher precedence than unary ops. `^` is an alias for `**`"
            example: """```livescript
                2 ** 4     #=> 16
                -2 ^ 2 ^ 3 #=> -256
            ```"""
        '.&.':
            detail: "bitwise and"
            example: """```livescript
                14 .&. 9   #=> 8
            ```"""
        '==':
            text: "~="
            detail: 'Fuzzy equality (with type coercion)'
            example: """```livescript
                2 ~= '2'       #=> true
                \\1 !~= 1       #=> false
            ```"""
        '>?':
            detail: 'Maximum'
            example: """```livescript
                4 >? 8     #=> 8
            ```"""
        '<?':
            detail: 'Minimum'
            example: """
              ```livescript
              9 - 5 <? 6 #=> 4
              ```
              """
        'instanceof':
            detail: 'Instanceof - list literals to the right get expanded'
            example:
                """```livescript
                new Date() instanceof Date           #=> true
                new Date() instanceof [Date, Object] #=> true
                ```"""
        'classof':
            text: 'typeof!'
            detail: 'Typeof - add a bang for a useful alternative'
            example: 
                """```livescript
                typeof /^/  #=> object
                typeof! /^/ #=> RegExp
                ```"""
              
    get-suggestions: (prefix) ->
        
        operators = []
        for k,v of @operators
            operators.push v.text ? k
        scored-operators = fuzzysort.go prefix.prefix, operators
        scored-operators.map ->
            score: it.score
            label: it.target
            kind: CompletionItemKind.Keyword
            data: 
                provider: "OperatorProvider"
