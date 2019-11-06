const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');
const keyBy = require('lodash.keyby');
const omit = require('lodash.omit');
const mapValues = require('lodash.mapvalues');
const lzString = require('lz-string');

const VEGA_EDITOR_BASE_URL = 'https://vega.github.io/editor/#/url/';

if (process.env.NODE_ENV !== 'production') {
  // load dev .env config
  require('dotenv').config();
}

// Read the signing secret from the environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

// Initialize the adapter to trigger listeners with envelope data and headers
const slackEvents = createEventAdapter(slackSigningSecret, {
  includeBody: true,
  includeHeaders: true,
});

// Initialize a Web Client
const slack = new WebClient(process.env.SLACK_ACCESS_TOKEN);

// Read the port from the environment variables, fallback to 3000 default.
const port = process.env.PORT || 3000;

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('link_shared', (event, body, headers) => {
  console.log(`\nlinks shared event: \n\tfrom user: ${event.user} in channel: ${event.channel}`);
  console.log(`\tevent id: ${body.event_id} event time: ${body.event_time}`);
  if (headers['X-Slack-Retry-Num'] !== undefined) {
    console.log(`event delivery was retried ${headers['X-Slack-Retry-Num']} times \
      because ${headers['X-Slack-Retry-Reason']}`);
  }
  console.log('\tlinks:');
  console.dir(event.links);

  // Call a helper that transforms the URL into a promise for an attachment suitable for Slack
  Promise.all(event.links.map(getLinkInfo))
    // Transform the array of attachments to an unfurls object keyed by URL
    .then(attachments => keyBy(attachments, 'url'))
    .then(unfurls => mapValues(unfurls, attachment => omit(attachment, 'url')))
    // Invoke the Slack Web API to append the attachment
    .then(unfurls => slack.apiCall('chat.unfurl', {
        channel: event.channel,
        ts: event.message_ts, 
        unfurls: unfurls
      }))
    .catch(console.error);
});

// All errors in listeners are caught here. If this weren't caught, the program would terminate.
slackEvents.on('error', (error) => {
  console.log(error.name); // TypeError
});

(async () => {
  // Start the built-in server
  const server = await slackEvents.start(port);

  // Log a message when the server is ready
  console.log(`Listening for events on port: ${server.address().port}`);
})();


function getLinkInfo(link) {
  const linkInfo = {
    "color": "#36a64f",
    "title": link.url,
    "title_link": link.url,
    "footer": "Vega Slack",
    url: link.url
  };
  if (link.url.startsWith(VEGA_EDITOR_BASE_URL)) {
    // extract vega spec from url
    const vegaUrlPart = link.url.replace(VEGA_EDITOR_BASE_URL, '');
    const vegaSpecPosition = vegaUrlPart.indexOf('/');
    const vegaSpecType = vegaUrlPart.substring(0, vegaSpecPosition);
    const compressedVegaSpec = vegaUrlPart.substring(vegaSpecPosition);
    const vegaSpecString = lzString.decompressFromEncodedURIComponent(compressedVegaSpec);
    const vegaSpec = JSON.parse(vegaSpecString);
    console.log(vegaSpec);
    
    // add vega spec title and description
    const title = vegaSpec['title'];
    const description = vegaSpec['description'];
    if (title !== undefined) {
      linkInfo['title'] = title;
    }
    else if (description !== undefined) {
      // use description for link title
      linkInfo['text'] = description;
    }

    if (description !== undefined) {
      // add description
      linkInfo['text'] = description;
    }
    console.log(`\tspec type: ${vegaSpecType}`);
  }
  return linkInfo;
}
