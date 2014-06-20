var fs = require('fs');

module.exports = function render(content, vars, callback) {
  if(vars instanceof Function) {
      callback = vars;
      vars = {};
  }
  fs.readFile('base.html', { flag: 'r' }, function load_template(err, template) {
      if(err) {throw err;}
      template = template.toString();
      fs.readFile(content, function load_content(err, data) {
          if(err) {throw err;}
          vars.content = data.toString();
          Object.keys(vars).forEach(function(k){
              template = template.replace(new RegExp('{{'+k+'}}','g'), vars[k]);
              console.log(template,k,vars[k]);
          });
          callback(template);
      });
  });
};