# vega-unfurl
Slack app for [Vega Editor](https://vega.github.io/editor) links preview ...

# Usage Example

1. Paste this [Vega-Lite](https://vega.github.io/vega-lite/) 
Stacked Bar Chart JSON spec example into online [Vega Editor](https://vega.github.io/editor):

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
  "title": "Weather by Month",
  "description": "Stacked Bar Chart",
  "data": {"url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv"},
  "mark": "bar",
  "encoding": {
    "x": {
      "timeUnit": "month",
      "field": "date",
      "type": "ordinal",
      "axis": {"title": "Month of the year"}
    },
    "y": {
      "aggregate": "count",
      "type": "quantitative"
    },
    "color": {
      "field": "weather",
      "type": "nominal",
      "scale": {
        "domain": ["sun", "fog", "drizzle", "rain", "snow"],
        "range": ["#e7ba52", "#c7c7c7", "#aec7e8", "#1f77b4", "#9467bd"]
      },
      "legend": {"title": "Weather type"}
    }
  }
}
```

2. Click Share in Vega Editor to copy url-encoded Vega spec.

3. Paste Vega spec URL into a Slack channel in a workspace with installed vega-unfurl Slack app.

You should see that shared url-encoded vega(-lite) spec link expended with new attachment containing vega chart title, description, vega json schema information, data links, view/save `.vg/.vl.json` links & image preview:

![Vega Unfurl Example](https://github.com/RandomFractals/vega-unfurl/blob/master/images/vega-unfurl-example.png?raw=true 
 "Vega Unfurl Example")

# Dev Log

See this dev.to post for more info:

https://dev.to/tarasnovak/vega-unfurl-slack-app-13i8

& [#vegaUnfurl](https://twitter.com/search?q=%23vegaUnfurl&src=typed_query) tag on Twitter for the latest & greatest updates on this front :) ...

# References

[Everything you ever wanted to know about unfurling ...](https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254)

[All will be revealed ...](https://medium.com/slack-developer-blog/all-will-be-revealed-ebcad7c531f0)

[Unfurling links in messages](https://api.slack.com/docs/message-link-unfurling)

[Slack Events API](https://slack.dev/node-slack-sdk/events-api)

[Developing Slack apps locally](https://slack.dev/node-slack-sdk/tutorials/local-development)
