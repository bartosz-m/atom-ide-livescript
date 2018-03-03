require! {
    \atom-languageclient : { AutoLanguageClient }
    \./config
}

# es classes bullshit
``class StandardLanguageClient extends AutoLanguageClient {}``
StandardLanguageClient.prototype <<<
  config: config
  # activate: ->
  #     @debug = atom.config.get \atom-livescript-provider.debug
  #     AutoLanguageClient::activate ...
      
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
  
  log: !->
      console.log "server:", it.message if @debug 
      
  pre-initialization: (connection) ->
      atom.config.observe \ide-livescript.debug (@debug) !~>
      connection.onLogMessage @~log

module.exports = new StandardLanguageClient!
