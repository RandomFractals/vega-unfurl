'use strict';

const lzString = require('lz-string');

const VEGA_EDITOR_BASE_URL = 'https://vega.github.io/editor/#/url/';
const VEGA_SCHEMA_BASE_URL = 'https://vega.github.io/schema/';
const VEGA_DATA_BASE_URL = 'https://vega.github.io/vega-datasets/';
const VEGA_UNFURL_BASE_URL = 'https://vega-unfurl.glitch.me/';

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
    // extract vega spec from url
    const vegaSpec = getVegaSpec(VEGA_EDITOR_BASE_URL, link.url);

    // extract vega spec title, description and json schema info
    const title = vegaSpec['title'];
    const description = vegaSpec['description'];
    const jsonSchemaUrl = vegaSpec['$schema'];

    // add title
    if (title !== undefined) {
      linkInfo['title'] = title;
    }
    else if (description !== undefined) {
      // use description for link title
      linkInfo['title'] = description;
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

    if (fields.length > 0) {
      // add fields
      linkInfo.fields = fields;
    }
  }
  return linkInfo;
} // end of getLinkInfo()


/**
 * Creates Vega spec from encoded vega spec url.
 * @param {string} baseUrl Vega spec base url to strip out.
 * @param {*} vegaSpecUrl Full Vega spec url.
 */
function getVegaSpec(baseUrl, vegaSpecUrl) {
  // extract vega spec from url
  const vegaSpecUrlPart = vegaSpecUrl.replace(baseUrl, '');
  const vegaSpecPosition = vegaSpecUrlPart.indexOf('/');
  const vegaSpecType = vegaSpecUrlPart.substring(0, vegaSpecPosition);
  console.log(`\tspec type: ${vegaSpecType}`);

  const compressedVegaSpec = vegaSpecUrlPart.substring(vegaSpecPosition + 1);
  const vegaSpecString = lzString.decompressFromEncodedURIComponent(compressedVegaSpec);
  const vegaSpec = JSON.parse(vegaSpecString);  
  // console.log(vegaSpecString);
  return vegaSpec;
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
