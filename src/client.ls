require! {
    \atom-languageclient : { AutoLanguageClient }
}

# console.log \atom-languageclient atom-languageclient

``class StandardLanguageClient extends AutoLanguageClient {}``
StandardLanguageClient.prototype <<<
  getGrammarScopes: -> ['source.livescript']
  getLanguageName: -> \LiveScript
  getServerName: -> 'LiveScript Language Server'

  startServerProcess:  ->
      console.log \startServerProcess @
      server-file = require.resolve('./server')
      console.log "starting #{server-file}"
      Promise.resolve @spawnChildNode [require.resolve('./server'), '--stdio']
      .catch (e) !->
        console.log e
        throw e
  preInitialization: (connection) ->
    connection.onLogMessage -> console.log it

module.exports = new StandardLanguageClient!
