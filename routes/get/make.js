'use strict';

const path = require('path');
const routeTemplatePath = path.join(__dirname + '../../../html/render.html');

function syntaxHighlight(json) {
  if (typeof json != 'string') json = JSON.stringify(json, undefined, 2);
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) cls = 'key';
      else cls = 'string';
    } else if (/true|false/.test(match)) cls = 'boolean';
    else if (/null/.test(match)) cls = 'null';
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

var route = function route(req, res, next, abe) {
  var html = abe.coreUtils.file.getContent(routeTemplatePath);
  var template = abe.Handlebars.compile(html, {noEscape: true})
  let render = ``;

  if(abe.config.paginate) {
    const files = abe.Manager.instance.getListWithStatusOnFolder('publish', '');
    const paginate = abe.config.paginate;
    let countTable = 0;

    for (const templateName in paginate) {
      const rex = new RegExp(paginate[templateName].folder);
      let count = 0;
      for (let i = 0; i < files.length; i++) if(templateName === files[i].abe_meta.template && rex.test(files[i].abe_meta.link)) count++;

      render += `<tr>
                  <th scope="row">${++countTable}</th>
                  <td>${templateName}</td>
                  <td>${count}</td>
                  <td><button class="btn btn-warning btn-xs action" data-template="${templateName}">Generate</button></td>
                </tr>`;
    }
  }

  var tmp = template({content: render, config: syntaxHighlight(JSON.stringify(abe.config.paginate, undefined, 2))});
  return res.send(tmp);
}

exports.default = route
