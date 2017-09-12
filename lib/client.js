var AutoLanguageClient, ref$;
AutoLanguageClient = require('atom-languageclient').AutoLanguageClient;
class StandardLanguageClient extends AutoLanguageClient {}
ref$ = StandardLanguageClient.prototype;
ref$.getGrammarScopes = function(){
  return ['source.livescript'];
};
ref$.getLanguageName = function(){
  return 'LiveScript';
};
ref$.getServerName = function(){
  return 'LiveScript Language Server';
};
ref$.startServerProcess = function(){
  var serverFile;
  console.log('startServerProcess', this);
  serverFile = require.resolve('./server');
  console.log("starting " + serverFile);
  return Promise.resolve(this.spawnChildNode([require.resolve('./server'), '--stdio']))['catch'](function(e){
    console.log(e);
    throw e;
  });
};
ref$.preInitialization = function(connection){
  return connection.onLogMessage(function(it){
    return console.log(it);
  });
};
module.exports = new StandardLanguageClient();
//# sourceMappingURL=/home/bartek/Projekty/atom/ide-livescript/lib/client.js.map
