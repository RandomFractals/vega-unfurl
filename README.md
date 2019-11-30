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

2. Click Share in Vega Editor to copy url-encoded Vega(-Lite) spec.

3. Paste Vega spec URL into a Slack channel in a workspace with installed Vega Unfurl Slack app.

You should see that shared url-encoded vega(-lite) spec link expended with new Slack message attachment containing vega chart title, description, vega json schema link, data links, view/save `.vg/.vl.json` links & image preview:

![Vega Unfurl Example](https://github.com/RandomFractals/vega-unfurl/blob/master/images/vega-unfurl-example.png?raw=true 
 "Vega Unfurl Example")

For this particular Stacked Bar Chart example those links are:

- schema: [vega-lite | v4](https://vega.github.io/schema/vega-lite/v4.json)
- data: https://vega.github.io/vega-datasets/data/seattle-weather.csv
- view/save: [vg.json](https://vega-unfurl.glitch.me/vg.json/vega-lite/N4KABGBEAkDODGALApgWwIaQFxUQFzwAdYsB6UgN2QHN0A6agSz0QFcAjOxge1IRQyUa6ALQAbZskoAWOgCtY3AHaQANOCh5mY5NigB1ZOhbIATmHYBPMAFllLNRsgATZAlONCW5XsgBlPHR4AGtkZzAAIXRzAGFEaLxHCBdjTBxgSFZTMV98IhJyKloGZjZOHiFaEWdU2GQ8WFIawL4jAh0RAHc2lFM6eFgKSABfdWSMU2DfdmikqGQleG5nRiVqPVAIZIAPDY0tzUZUZABVJWZfVHtEOYPIADNGZDFnX2bdMYPNS0JdHEhuKYVkp0DlPnd0NtGLANpAtHgdL47EoWGBuPcwCYwJYjKYRvswKMCZBLHsvlB0NRqKZhHg-lAlqwUbctnCfvTIABHVjoFHMYyMKiQAlEu5LMSAslfB5PF6+brGXos5J4dm+JTcVCrUHKqAIUH0zbkqDOTXoVZ6ADakFgTLUUHu3HWqhNHgAXm7ES7IKZzSpvbANZ1IABdcHS31renWgDEyAA7DMAKwAJntkBj8HjWaz6Zj6GQWeQAA48wBGe7xxPSPMATmkADZE68QwSIKLpTpqAtXuk4doOYZFWZMWrhiKNOPx0A) | [vl.json](https://vega-unfurl.glitch.me/vl.json/vega-lite/N4KABGBEAkDODGALApgWwIaQFxUQFzwAdYsB6UgN2QHN0A6agSz0QFcAjOxge1IRQyUa6ALQAbZskoAWOgCtY3AHaQANOCh5mY5NigB1ZOhbIATmHYBPMAFllLNRsgATZAlONCW5XsgBlPHR4AGtkZzAAIXRzAGFEaLxHCBdjTBxgSFZTMV98IhJyKloGZjZOHiFaEWdU2GQ8WFIawL4jAh0RAHc2lFM6eFgKSABfdWSMU2DfdmikqGQleG5nRiVqPVAIZIAPDY0tzUZUZABVJWZfVHtEOYPIADNGZDFnX2bdMYPNS0JdHEhuKYVkp0DlPnd0NtGLANpAtHgdL47EoWGBuPcwCYwJYjKYRvswKMCZBLHsvlB0NRqKZhHg-lAlqwUbctnCfvTIABHVjoFHMYyMKiQAlEu5LMSAslfB5PF6+brGXos5J4dm+JTcVCrUHKqAIUH0zbkqDOTXoVZ6ADakFgTLUUHu3HWqhNHgAXm7ES7IKZzSpvbANZ1IABdcHS31renWgDEyAA7DMAKwAJntkBj8HjWaz6Zj6GQWeQAA48wBGe7xxPSPMATmkADZE68QwSIKLpTpqAtXuk4doOYZFWZMWrhiKNOPx0A)

You can also use Vega Unfurl slack app document handlers to save that bar chart [svg](https://vega-unfurl.glitch.me/svg/vega-lite/N4KABGBEAkDODGALApgWwIaQFxUQFzwAdYsB6UgN2QHN0A6agSz0QFcAjOxge1IRQyUa6ALQAbZskoAWOgCtY3AHaQANOCh5mY5NigB1ZOhbIATmHYBPMAFllLNRsgATZAlONCW5XsgBlPHR4AGtkZzAAIXRzAGFEaLxHCBdjTBxgSFZTMV98IhJyKloGZjZOHiFaEWdU2GQ8WFIawL4jAh0RAHc2lFM6eFgKSABfdWSMU2DfdmikqGQleG5nRiVqPVAIZIAPDY0tzUZUZABVJWZfVHtEOYPIADNGZDFnX2bdMYPNS0JdHEhuKYVkp0DlPnd0NtGLANpAtHgdL47EoWGBuPcwCYwJYjKYRvswKMCZBLHsvlB0NRqKZhHg-lAlqwUbctnCfvTIABHVjoFHMYyMKiQAlEu5LMSAslfB5PF6+brGXos5J4dm+JTcVCrUHKqAIUH0zbkqDOTXoVZ6ADakFgTLUUHu3HWqhNHgAXm7ES7IKZzSpvbANZ1IABdcHS31renWgDEyAA7DMAKwAJntkBj8HjWaz6Zj6GQWeQAA48wBGe7xxPSPMATmkADZE68QwSIKLpTpqAtXuk4doOYZFWZMWrhiKNOPx0A) || [png](https://vega-unfurl.glitch.me/png/vega-lite/N4KABGBEAkDODGALApgWwIaQFxUQFzwAdYsB6UgN2QHN0A6agSz0QFcAjOxge1IRQyUa6ALQAbZskoAWOgCtY3AHaQANOCh5mY5NigB1ZOhbIATmHYBPMAFllLNRsgATZAlONCW5XsgBlPHR4AGtkZzAAIXRzAGFEaLxHCBdjTBxgSFZTMV98IhJyKloGZjZOHiFaEWdU2GQ8WFIawL4jAh0RAHc2lFM6eFgKSABfdWSMU2DfdmikqGQleG5nRiVqPVAIZIAPDY0tzUZUZABVJWZfVHtEOYPIADNGZDFnX2bdMYPNS0JdHEhuKYVkp0DlPnd0NtGLANpAtHgdL47EoWGBuPcwCYwJYjKYRvswKMCZBLHsvlB0NRqKZhHg-lAlqwUbctnCfvTIABHVjoFHMYyMKiQAlEu5LMSAslfB5PF6+brGXos5J4dm+JTcVCrUHKqAIUH0zbkqDOTXoVZ6ADakFgTLUUHu3HWqhNHgAXm7ES7IKZzSpvbANZ1IABdcHS31renWgDEyAA7DMAKwAJntkBj8HjWaz6Zj6GQWeQAA48wBGe7xxPSPMATmkADZE68QwSIKLpTpqAtXuk4doOYZFWZMWrhiKNOPx0A) for sharing with your vega data viz team.

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
