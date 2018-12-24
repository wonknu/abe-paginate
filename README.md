# abe-paginate

> Paginate plugin for Abecms

## Install

```shell
abe install wonknu/abe-paginate
```

If already installed inside a project, just do `npm i` the plugin listed inside package.json will be installed

## config

Inside abe.json file, create a entry `"paginate": {}` which will hold all the configuration for this plugin.

Then each key inside *paginate* will be the name of a template which will hold the configuration for this template
example:
```json
  "TEMPLATE_NAME": {}
```

### configuration options

- count_per_page: (Integer) nombre of item to display per page
- selector: (Regex) a regex that match one and only html tag with 3 capturing group
  - $1: start of the html tag (ex: `(<div ...>)`)
  - $2: content that will be used to inject the pager (ex: `(\r|\t|\n|.)*?`) with pagination number (`1, 2, ..., n`)
  - $1: end of the html tag (ex: `(</div>)`)
- folder: (Regex) a regex that match where the url/path of the templates to paginate are (`\/.*?\/folder-name\/` match `/any-folder/folder-name`)
- jsonKey: (String) the name of the property of the json data source where the array of pages is listed
- regex_tag_abe: (Regex) That match a tag abe to remove data it temporary before the publication to override it's value with paginated

Full exemple:
We have this template folder structure:
```
_ templates
  |_ index.html
  |_ push.html
```

- Index is the hub, and push are template that will be use to populate the hub and the pagination.
- Inside index we have a `div.pager` which is the place holder for the pagination (`1, 2, ..., n`)
  - $1: `(<div class=\"pager\">)` the starting div with a unique class name
  - $2: `(\r|\t|\n|.)` anything between this div
  - $3 `(</div>)` closing div
- the folder path where index template is publish is `/gb/website/index.html`, `/fr/website/index.html`, `/es/website/index.html` ...
- Index file use a tag abe type data which fetch pushes and hold them inside a json key named `pushes`

```json
"paginate": {
  "index": {
    "count_per_page": 10,
    "selector": "(<div class=\"pager\">)(\r|\t|\n|.)*?(</div>)",
    "folder": "\/.*?\/website\/",
    "jsonKey": "pushes",
    "regex_tag_abe": "\\{\\{mergeArray @root \\'push_topthing_manual\\' \\'push_topthing_auto\\' \\'push_topthings\\'\\}\\}"
  }
}
```

We need to create some content becaues only published page will be includ inside the pagination plugin

ex: 1 index.html & 50 pushes
```
_ site
  |_ gb
    |_ website
      |_ index.html
      |_ push-1.html
      |_ push-2.html
      |_ push-3.html
      |_ push-4.html
      |_ ...
      |_ push-50.html
```

then go to `/abe/plugin/paginate/make`

You can now generate the pagination template by template. Click *Generate*

![Paginate plugin list](/img/demo.png)

```
_ site
  |_ gb
    |_ website
      |_ index.html

      |_ index-1.html
      |_ index-2.html
      |_ index-3.html
      |_ index-4.html
      |_ index-5.html

      |_ push-1.html
      |_ push-2.html
      |_ push-3.html
      |_ push-4.html
      |_ ...
      |_ push-50.html
```

We now have 5 new file `index-1.html, index-2.html, index-3.html, index-4.html, index-5.html` because there are 50 push with a pagination 10 per page

