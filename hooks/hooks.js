'use strict';

var hooks = {
  afterHandlebarsHelpers: function(Handlebars, abe) {
    Handlebars.registerHelper("paginateUrl", function(obj, index, options){
      if(JSON.stringify(this) === '{}' || !obj) return '';
      var ext = `.${abe.config.files.templates.extension}`;
      return `${obj.replace(ext, '-' + (index + 1) + ext)}`;
    });
    return Handlebars
  }
};

exports.default = hooks;
