// load .env config
require('dotenv').config();

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');
const keyBy = require('lodash.keyby');
const omit = require('lodash.omit');
const mapValues = require('lodash.mapvalues');
const compactStringify = require('json-stringify-pretty-compact');
const vega = require('vega');
const vegaLite = require('vega-lite');
const vegaUtils = require('./vega-utils.js');

// create Slack events adapter with envelope data and headers
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret, {
  includeBody: true,
  includeHeaders: true,
});

// create Slack web client
const slack = new WebClient(process.env.SLACK_ACCESS_TOKEN);

// add link_shared Slack event handler
slackEvents.on('link_shared', (event, body, headers) => {
  // log slack event info
  console.log(`\nlinks shared event: \n\tfrom user: ${event.user} in channel: ${event.channel}`);
  console.log(`\tevent id: ${body.event_id} event time: ${body.event_time}`);
  if (headers['X-Slack-Retry-Num'] !== undefined) {
    console.log(`event delivery was retried ${headers['X-Slack-Retry-Num']} times \
      because ${headers['X-Slack-Retry-Reason']}`);
  }
  console.log('\tlinks:');
  console.dir(event.links);

  // transform all Vega links to unfurled attachments
  Promise.all(event.links.map(vegaUtils.getLinkInfo))
    // transform expended link info to unfurls keyed by url
    .then(attachments => keyBy(attachments, 'url'))
    .then(unfurls => mapValues(unfurls, attachment => omit(attachment, 'url')))
    // send unfurled link attachements to Slack
    .then(unfurls => slack.apiCall('chat.unfurl', {
        channel: event.channel,
        ts: event.message_ts, 
        unfurls: unfurls
      }))
    .catch(console.error);
});

// add generic Slack events error handler
slackEvents.on('error', (error) => {
  console.log(error);
});

// create express app
const app = express();

// add slack events listener
app.use('/slack/events', slackEvents.requestListener());

// add vega document handler
app.use('/vg.json', (request, response) => {
  const vegaSpecInfo = vegaUtils.getVegaSpecInfo('/vg.json/', request.originalUrl);
  response.setHeader('Content-Type', 'application/json');
  if (vegaSpecInfo.type === 'vega') {
    // send decoded vega spec string
    response.send(vegaSpecInfo.specString);
  } else {
    // compile vega-lite spec to vega
    const vgSpec = vegaLite.compile(vegaSpecInfo.spec).spec;
    // send compiled vega spec json
    response.send(compactStringify(vgSpec));
  }
});

// add vega-lite document hander
app.use('/vl.json', (request, response) => {
  const vegaSpecInfo = vegaUtils.getVegaSpecInfo('/vl.json/', request.originalUrl);
  response.setHeader('Content-Type', 'application/json');
  // send decoded vega-lite spec string
  response.send(vegaSpecInfo.specString);
});

// add vega svg document handler
app.use('/svg', (request, response) => {
  const vegaSpecInfo = vegaUtils.getVegaSpecInfo('/svg/', request.originalUrl);
  let vegaSpec = vegaSpecInfo.spec;
  if (vegaSpecInfo.type === 'vega-lite') {
    // compile vega-lite spec to vega
    vegaSpec = vegaLite.compile(vegaSpecInfo.spec).spec;
  }

  // create headless vega viewer instance for svg gen.
  const vegaView = new vega.View(vega.parse(vegaSpec), {
    loader: vega.loader({baseURL: 'https://vega.github.io/vega-datasets/'}),
    renderer: 'none'
  }).finalize();

  // create and send svg image
  vegaView.toSVG().then(svg => {
    response.setHeader('Content-Type', 'image/svg+xml');
    response.send(svg);
  });
});

// add vega png document handler
app.use('/png', (request, response) => {
  const vegaSpecInfo = vegaUtils.getVegaSpecInfo('/png/', request.originalUrl);
  let vegaSpec = vegaSpecInfo.spec;
  if (vegaSpecInfo.type === 'vega-lite') {
    // compile vega-lite spec to vega
    vegaSpec = vegaLite.compile(vegaSpecInfo.spec).spec;
  }

  // create headless vega viewer instance for svg gen.
  const vegaView = new vega.View(vega.parse(vegaSpec), {
    loader: vega.loader({baseURL: 'https://vega.github.io/vega-datasets/'}),
    renderer: 'none'
  }).finalize();

  // create and send png image
  vegaView.toCanvas().then(canvas => {
    response.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(response);
  });
});

// mount json body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// start http server
const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, () => {
  // log server started message
  console.log(`Listening for events on port: ${server.address().port}`);
});
