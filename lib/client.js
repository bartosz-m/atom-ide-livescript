var AutoLanguageClient, config, ref$;
AutoLanguageClient = require('atom-languageclient').AutoLanguageClient;
config = require('./config');
class StandardLanguageClient extends AutoLanguageClient {}
ref$ = StandardLanguageClient.prototype;
ref$.config = config;
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
ref$.log = function(it){
  if (this.debug) {
    console.log("server:", it.message);
  }
};
ref$.preInitialization = function(connection){
  var this$ = this;
  atom.config.observe('ide-livescript.debug', function(debug){
    this$.debug = debug;
  });
  return connection.onLogMessage(bind$(this, 'log'));
};
module.exports = new StandardLanguageClient();
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
//# sourceMappingURL=client.js.map
