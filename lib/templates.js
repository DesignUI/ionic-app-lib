var colors = require('colors'),
    path = require('path'),
    _ = require('underscore'),
    Q = require('q'),
    Task = require('./task').Task,
    IonicStats = require('./stats').IonicStats,
    request = require('request'),
    log = require('./logging').logger;
    // starterTemplates = require('./starter-templates')

var IonicTask = function() {};

IonicTask.prototype = new Task();

IonicTask.prototype.fetchStarterTemplates = function() {
  var self = this;

  // log.info('About to fetch template');
  var downloadUrl = 'http://code.ionicframework.com/content/starter-templates.json';
  var starterTemplateJsonPath = path.resolve(__dirname, 'starter-templates.json');

  // log.info('\nDownloading Starter Templates'.bold, downloadUrl, starterTemplateJsonPath);
  log.info('\nDownloading Starter Templates'.bold, '-', downloadUrl);

  var q = Q.defer();

  var proxy = process.env.PROXY || null;
  request({ url: downloadUrl, proxy: proxy }, function(err, res, html) {
    if(!err && res && res.statusCode === 200) {
      var templatesJson = {};
      try {
        templatesJson = JSON.parse(html);
      }catch(ex) {
        log.error('Error: ', ex)
        q.reject('Error occured in download templates:', ex)
        self.ionic.fail(ex);
        return;
      }
      q.resolve(templatesJson);
    } else {
      log.error('Unable to fetch the starter templates. Please check your internet connection');
      q.reject(res);
    }
  });
  return q.promise;
};

IonicTask.prototype.list = function list(templates) {
  //Should have array of [{ name: 'name', description: 'desc' }]
  log.info('\n')
  _.each(templates, function(template) {
    var rightColumn = 20, dots = '';
    var shortName = template.name.replace('ionic-starter-', '');
    while( (shortName + dots).length < rightColumn + 1) {
      dots += '.';
    }
    var outStr = []
    log.info(shortName, dots, template.description);
  })
}

IonicTask.prototype.run = function(ionic) {
  var self = this;

  self.fetchStarterTemplates()
  .then(function(starterTemplates) {
    self.list(starterTemplates.items);
  })

  var templates = _.sortBy(starterTemplates.items, function(template){ return template.name; });
  log.info('Ionic Starter templates');
  this.list(templates);

}

exports.IonicTask = IonicTask;
