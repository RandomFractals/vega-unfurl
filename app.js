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
