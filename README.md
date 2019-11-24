# vega-unfurl
Slack app for Vega Editor links preview

# Usage Example

1. Paste this [Vega-Lite](https://vega.github.io/vega-lite/) 
Bar Chart JSON spec example into online [Vega Editor](https://vega.github.io/editor):

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
  "title": "Bar Chart",
  "description": "A simple bar chart with embedded data.",
  "data": {
    "values": [
      {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
      {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
      {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "ordinal"},
    "y": {"field": "b", "type": "quantitative"}
  }
}
```

2. Click Share in Vega Editor to copy encoded vega spec URL.

3. Paste vega spec URL into a Slack channel in a workspace with installed vega-unfurl app.

You should see that shared link expended with new attachment containing vega chart title,
description and json schema information extracted from the shared encoded link.

![Vega Unfurl Example](https://github.com/RandomFractals/vega-unfurl/blob/master/images/vega-unfurl-example.png?raw=true 
 "Vega Unfurl Example")

# Dev Log

See this dev.to post for more info:

https://dev.to/tarasnovak/vega-unfurl-slack-app-13i8

# References

[Everything you ever wanted to know about unfurling ...](https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254)

[All will be revealed ...](https://medium.com/slack-developer-blog/all-will-be-revealed-ebcad7c531f0)

[Unfurling links in messages](https://api.slack.com/docs/message-link-unfurling)

[Slack Events API](https://slack.dev/node-slack-sdk/events-api)

[Developing Slack apps locally](https://slack.dev/node-slack-sdk/tutorials/local-development)
