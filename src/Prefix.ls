module.exports = Prefix =
    init: ({@document,@position}) !->
        @lines = @document.get-text!split '\n'
        @line = @lines.[@position.line]
        @to-position = @line.substring 0, @position.character
        @before = @to-position.substring 0, @to-position.length - 1
        @text =  @to-position .trim-left!
        @prefix = @text.split ' ' .[* - 1]
    
    is-inside-new: ->
        const re = /\s*new\s+/
        re.test @before

    /** sprawdza czy jest wewnątrz require */
    is-inside-require: ->
        string-literals = [
            "'[^'\\n]+'"
            '"[^"\\n]+"'
            "\\\\[^\\\\\"'\\n]+"
        ]
        #użuwam atomic group (?>) aby nie dopuścić do 'catastrophic backtracking' - regexp
        r-or = (...x) ->
            "(?>#{x.join '|'})"
        ws = "(?>\\s+)"
        id = "\\w+"
        s = string-literal = "\\s*#{r-or ...string-literals}\\s*"
        # czysty javascript tego nie obsługuje
        koniec-pliku = "\\Z"

        any = "[a-zA-Z\\n]"
        obj-lit = "{(?:#{ws}?#{id},?)+}"
        ds = destruct = ":#{ws}?(?:#{id}|#{obj-lit})"
        imp = "#{s}(?:#{ds})?"
        simple-require = new OnigRegExp "require#{ws}#{koniec-pliku}"
        macro-require = new OnigRegExp "require!#{ws}?{#{koniec-pliku}"

        scope-lines = []
        current-line = @position.row
        last-indent = 100000000
        r-indent = /^\s*/
        do
            line = @edytor.get-buffer!line-for-row current-line
            indent = line.match r-indent .0.length
            if indent < last-indent
                last-indent = indent
                scope-lines.push line

            current-line = @edytor.get-buffer!previous-non-blank-row current-line
        while current-line? and last-indent != 0
        unless simple-require.test-sync @prefix
            requires = scope-lines.filter -> macro-require.test-sync it
            requires.length > 0
        else
            true
        
    create: ->
        Object.create @
            ..init ...&