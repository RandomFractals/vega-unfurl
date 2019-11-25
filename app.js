const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');
const keyBy = require('lodash.keyby');
const omit = require('lodash.omit');
const mapValues = require('lodash.mapvalues');
const vegaUtils = require('./vega-utils.js');

// load .env config
require('dotenv').config();

// create Slack events adapter with envelope data and headers
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret, {
  includeBody: true,
  includeHeaders: true,
});

// create Slack web client
const slack = new WebClient(process.env.SLACK_ACCESS_TOKEN);
const port = process.env.PORT || 3000;

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

(async () => {
  // start the built-in server
  const server = await slackEvents.start(port);

  // log server started message
  console.log(`Listening for events on port: ${server.address().port}`);
})();
