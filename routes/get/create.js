'use strict';

const path = require('path');
const fs = require('fs-extra');
const routeTemplatePath = path.join(__dirname + '../../../html/render.html');

var createPages = function createPages (abe, template, originalPath, newPath, json, pager, currentIndex, currentPageIndex, isLast, regex_tag_abe) {
  json = JSON.parse(JSON.stringify(json).replace(originalPath, newPath))
  var postPath = path.join(abe.config.root, abe.config.publish.url, newPath);
  var template = abe.cmsTemplates.template.getTemplate(json.abe_meta.template)
  json['abe_meta'].complete = abe.cmsData.utils.getPercentOfRequiredTagsFilled(abe.cmsTemplates.template.getTemplate(json.abe_meta.template), json);
  
  template = template.replace(new RegExp(abe.config.paginate[json.abe_meta.template].selector), `$1${pager}$2`)
                      .replace(new RegExp(`(<a.*?-${currentIndex}\.html">+?)(\r|\t|\n|.*?${currentIndex}\r|\t|\n|.)*?(<\/a>+?)`), currentIndex);


  let splitUrl = newPath.slice(0, newPath.length - (abe.config.files.templates.extension.length + 2));

  if(currentPageIndex > 1) {
    template = template.replace(/(<linkrel=\"prev\" href=\")(.*?)(\" \/>)/, `$1${splitUrl}${currentPageIndex - 1}.${abe.config.files.templates.extension}$3`);
  }
  else template = template.replace(/(<linkrel=\"prev\" href=\")(.*?)(\" \/>)/, '');
  if(!isLast) {
    template = template.replace(/(<linkrel=\"next\" href=\")(.*?)(.\.html)(\" \/>)/, `$1${splitUrl}${currentPageIndex + 1}.${abe.config.files.templates.extension}$3`);
  }
  else template = template.replace(/(<linkrel=\"next\" href=\")(.*?)(\" \/>)/, '');

  if(regex_tag_abe) template = template.replace(new RegExp(regex_tag_abe), '');

  var page = new abe.Page(json.abe_meta.template, template, json, true);

  if (!abe.cmsOperations.save.saveHtml(postPath, page.html)) {}
}

var getPager = function getPager(abe, filePath, total) {
  var html = `<ul>`;
  var ext = `.${abe.config.files.templates.extension}`;

  for (let i = 0; i < total; i++) {
    html += `<li style="display:inline-block;">
                <a href="${filePath.replace(path.join(abe.config.root, 'site'), '').replace(ext, '-' + (i + 1) + ext)}">
                  ${(i + 1)}
                </a>
              </li>`;
  }

  return `${html}</ul>`;
}

var getPages = function getPages (abe, templateName, htmlPath, jsonPath, element) {
  return new Promise(function(resolve, reject) {
    const regex_tag_abe = element.regex_tag_abe ? element.regex_tag_abe : null;
    const count_per_page = element.count_per_page;

    fs.pathExists(htmlPath, (err, exists) => {
      fs.pathExists(jsonPath, (err, exists) => {
        const json = fs.readJsonSync(jsonPath);
        const data = json[element.jsonKey];
        let counter = count_per_page;
        let nbPage = 0;
        let newData = {};
        newData[element.jsonKey] = [];

        let pager = getPager(abe, htmlPath, data.length / count_per_page);
        let currentIndex = 1

        let j = 0;
        for (j = 0; j < data.length; j++) {
          newData[element.jsonKey].push(data[j])
          if(--counter === 0) {
            counter = count_per_page;
            createPages(
              abe,
              templateName,
              htmlPath.replace(`${abe.config.root}/site`, ''),
              htmlPath.replace(`.${abe.config.files.templates.extension}`, `-${++nbPage}.${abe.config.files.templates.extension}`).replace(`${abe.config.root}/site`, ''),
              Object.assign(json, newData),
              pager,
              currentIndex,
              parseInt(currentIndex/count_per_page) + 1,
              false,
              regex_tag_abe
            )
            currentIndex += (count_per_page + 1);
            newData = {};
            newData[element.jsonKey] = [];
          }
          if(j === data.length - 1 && counter === 20) counter = 0;
        }
        if(counter > 0) {
          newData[element.jsonKey] = data.slice(data.length - (count_per_page - counter));
          createPages(
            abe,
            templateName,
            htmlPath.replace(`${abe.config.root}/site`, ''),
            htmlPath.replace(`.${abe.config.files.templates.extension}`, `-${++nbPage}.${abe.config.files.templates.extension}`).replace(`${abe.config.root}/site`, ''),
            Object.assign(json, newData),
            pager,
            currentIndex,
            parseInt(currentIndex/count_per_page),
            true,
            regex_tag_abe
          )
        }

        resolve();
      })
    })
  });
};

var route = function route(req, res, next, abe) {
  if(!req.query || !req.query.template) return res.send(JSON.stringify({ko: 'ko'}));

  if(abe.config.paginate) {
    const files = abe.Manager.instance.getListWithStatusOnFolder('publish', '');
    const paginate = abe.config.paginate;
    const templateName = req.query.template;
    const rex = new RegExp(paginate[templateName].folder);
    let countEnd = 0;
    for (let i = 0; i < files.length; i++) {
      if(rex.test(templateName === files[i].abe_meta.template && files[i].abe_meta.link)) {
        countEnd++;
        getPages(
          abe,
          templateName,
          path.join(abe.config.root, 'site', files[i].abe_meta.link),
          path.join(abe.config.root, 'data', files[i].abe_meta.link.replace(`.${abe.config.files.templates.extension}`, '.json')),
          paginate[templateName]
        ).then(() => (--countEnd === 0) && res.send(JSON.stringify({ok: 'ok'})))
      }
    }
  }
}

exports.default = route
