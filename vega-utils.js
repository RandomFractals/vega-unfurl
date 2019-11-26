'use strict';

const lzString = require('lz-string');

const VEGA_EDITOR_BASE_URL = 'https://vega.github.io/editor/#/url/';
const VEGA_SCHEMA_BASE_URL = 'https://vega.github.io/schema/';
const VEGA_DATA_BASE_URL = 'https://vega.github.io/vega-datasets/';
const VEGA_UNFURL_BASE_URL = 'https://vega-unfurl.glitch.me/';
const VEGA_DOCUMENT_TYPES = ['svg', 'png', 'vg.json'];

/**
 * Converts shared Slack link to an unfurl object
 * for custom vega unfurl message attachment.
 * @param {string} link The Vega link to unfurl.
 */
function getLinkInfo(link) {
  // create initial unfurl link info
  const linkInfo = {
    "color": "#36a64f",
    "title": link.url,
    "title_link": link.url,
    "footer": "Vega Slack",
    url: link.url
  };

  if (link.url.startsWith(VEGA_EDITOR_BASE_URL)) {
    // extract vega spec info from url
    const vegaSpecInfo = getVegaSpecInfo(VEGA_EDITOR_BASE_URL, link.url);
    const vegaSpec = vegaSpecInfo.spec;

    // extract vega spec title, description and json schema info
    const title = vegaSpec['title'];
    const description = vegaSpec['description'];
    const jsonSchemaUrl = vegaSpec['$schema'];

    // add title
    if (title !== undefined) {
      linkInfo['title'] = `${title}.${vegaSpecInfo.type}`;
    }
    else if (description !== undefined) {
      // use description for link title
      linkInfo['title'] = `${description.substr(0, 100)}.${vegaSpecInfo.type}`;
    } else {
      linkInfo['title'] = `Unititled.${vegaSpecInfo.type}`;
    }

    // add description
    if (description !== undefined) {
      linkInfo['text'] = description;
    }

    // add json schema info
    const fields = [];
    if (jsonSchemaUrl !== undefined) {
      const vegaSchemaTitle = jsonSchemaUrl.replace(VEGA_SCHEMA_BASE_URL, '').replace('/', ' | ').replace('.json', '')
      fields.push({
        title: 'schema',
        value: `:small_blue_diamond: <${jsonSchemaUrl}|${vegaSchemaTitle}>`
      });
    }

    // add data links
    const dataLinks = getDataLinks(vegaSpec);
    if (dataLinks.length > 0) {
      fields.push({
        title: 'data',
        value: dataLinks.map(link => `:small_blue_diamond: <${link}|${link}>`).join('\n')
      });
    }

    // add download links
    fields.push({
      title: 'view/save',
      value: VEGA_DOCUMENT_TYPES.map(type => { 
        return `<${VEGA_UNFURL_BASE_URL}${type}#url/${vegaSpecInfo.type}/${vegaSpecInfo.compressedString}|${type}>`;
      }).join(' | ')
    });

    if (fields.length > 0) {
      // add fields
      linkInfo.fields = fields;
    }
  }
  return linkInfo;
} // end of getLinkInfo()


/**
 * Creates Vega spec info from encoded vega spec url.
 * @param {string} baseUrl Vega spec base url to strip out.
 * @param {*} vegaSpecUrl Full Vega spec url.
 */
function getVegaSpecInfo(baseUrl, vegaSpecUrl) {
  // extract vega spec from url
  const vegaSpecUrlPart = vegaSpecUrl.replace(baseUrl, '');
  const vegaSpecPosition = vegaSpecUrlPart.indexOf('/');
  const vegaSpecType = vegaSpecUrlPart.substring(0, vegaSpecPosition);
  console.log(`\tspec type: ${vegaSpecType}`);

  const compressedVegaSpec = vegaSpecUrlPart.substring(vegaSpecPosition + 1);
  const vegaSpecString = lzString.decompressFromEncodedURIComponent(compressedVegaSpec);
  const vegaSpec = JSON.parse(vegaSpecString);  
  // console.log(vegaSpecString);
  return {
    type: (vegaSpecType === 'vega' ? 'vg.json' : 'vl.json'),
    spec: vegaSpec,
    compressedString: compressedVegaSpec
  };
}


/**
 * Extracts data urls from Vega spec.
 * @param spec Vega spec document.
 */
function getDataLinks(spec) {
  // get top level data urls
  let dataUrls = getDataUrls(spec);

  // add nested spec data urls for view compositions (facets, repeats, etc.)
  dataUrls = dataUrls.concat(getDataUrls(spec['spec']));
  console.log('dataUrls:', dataUrls);

  // create data links to attach
  return dataUrls.map(dataUrl => {
    if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
      // add remote data source reference
      return dataUrl;
    }
    else {
      // convert relative data urls to vega data sets references for built-in examples
      return (VEGA_DATA_BASE_URL + dataUrl);
    }
  });
}


/**
 * Recursively extracts data urls from the specified vega spec document.
 * @param spec Vega spec document root or nested vega data container.
 */
function getDataUrls(spec) {
  let dataUrls = [];
  if (spec === undefined){
    return dataUrls; // base case
  }
  const data = spec['data'];
  const transforms = spec['transform'];
  let layers = [];
  layers = layers.concat(spec['layer']);
  layers = layers.concat(spec['concat']);
  layers = layers.concat(spec['hconcat']);
  layers = layers.concat(spec['vconcat']);
  if (data !== undefined) {
    // get top level data references
    if (Array.isArray(data)) {
      data.filter(d => d['url'] !== undefined).forEach(d => {
        dataUrls.push(d['url']);
      });
    }
    else if (data['url'] !== undefined) {
      dataUrls.push(data['url']);
    }
  }
  if (layers !== undefined && Array.isArray(layers)) {
    // get layers data references
    layers.forEach(layer => {
      dataUrls = dataUrls.concat(getDataUrls(layer));
    });
  }
  if (transforms !== undefined) {
    // get transform data references
    transforms.forEach(transformData => {
      dataUrls = dataUrls.concat(getDataUrls(transformData['from']));
    });
  }
  return dataUrls;
}

module.exports = {
  getLinkInfo: getLinkInfo
};
