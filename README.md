# LaMetric Cloud 1.0.0

An asynchronous client library for the [Cloud API of LaMetric Time](http://lametric-documentation.readthedocs.io/en/latest/guides/first-steps/first-lametric-indicator-app.html). 

```javascript
const LaMetricCloud = require('lametric-cloud');

const client = new LaMetricCloud({
  access_token: ''
});

client.updateWidget(widgetId, frames, widgetVersion)
  .catch(console.error);
```

## Installation

`npm install lametric-cloud`

You will need to create your lametric indicator app and retrieve access token and widget information. You can follow instructions [here](http://lametric-documentation.readthedocs.io/en/latest/guides/first-steps/first-lametric-indicator-app.html). 

```javascript
const LaMetricCloud = require('lametric-cloud');

const client = new LaMetricCloud({
  access_token: '<access token>'
});
```

## Requests

### With endpoints

You now have the ability to make GET, POST, PUT and DELETE requests against the API via the convenience methods.

```javascript
client.get(path, params);
client.post(path, params);
client.put(path, params);
client.delete(path, params);
```

You simply need to pass the endpoint and parameters to one of convenience methods. Take a look at the [documentation site](http://lametric-documentation.readthedocs.io/en/latest/reference-docs/device-endpoints.html) to reference available endpoints.

```javascript
client.post('dev/widget/update/com.lametric.fez4fsg3Z/2', [
  {
    "text": "Hello World",
    "icon": "i3219"
  }
]);
```

### With client methods

You can use the defined client methods to call endpoints.

```javascript
client.updateWidget('com.lametric.fez4fsg3Z', [
  {
    "text": "Hello World",
    "icon": "i3219"
  }
], 2);
```

## Promises

The request will return Promise.


```javascript
client.updateWidget('com.lametric.fez4fsg3Z', [
  {
    "text": "Hello World",
    "icon": "i3219"
  }
], 2)
  .catch(function (e) {
    throw e;
  });
```
