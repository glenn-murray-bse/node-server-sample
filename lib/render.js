var fs = require('fs');

module.exports = function render(content, vars, callback) {
  if(vars instanceof Function) {
      callback = vars;
      vars = {};
  }
  fs.readFile('base.html', function load_template(err, base) {
    if(err) {throw err;}
    fs.readFile(content, function load_content(err, data) {
        if(err) {throw err;}
        vars.content = data.toString();
        callback(Object.keys(vars).reduce(function(template, k){
          return template.replace(new RegExp('{{'+k+'}}','g'), vars[k]);
        }, base.toString()));
    });
  });
};