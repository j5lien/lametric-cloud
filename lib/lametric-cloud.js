'use strict';

/**
 * Module dependencies
 */

const request = require('request');
const extend = require('deep-extend');

// Package version
const VERSION = require('../package.json').version;

function LaMetricCloud(options) {
  if (!(this instanceof LaMetricCloud)) {
    return new LaMetricCloud(options);
  }

  this.VERSION = VERSION;

  // Merge the default options with the client submitted options
  this.options = extend({
    base_url: 'https://developer.lametric.com',
    access_token: null,
    api_version: 'v1',
    request_options: {
      headers: {
        Accept: 'application/json',
        Connection: 'close',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'lametric-cloud/' + VERSION
      }
    }
  }, options);

  const authentication_options = {};
  if (this.options.access_token) {
    authentication_options.headers = {
      'X-Access-Token': this.options.access_token
    };
  }

  // Configure default request options
  this.request = request.defaults(
    extend(
      this.options.request_options,
      authentication_options
    )
  );
}

LaMetricCloud.prototype.__buildEndpoint = function(path) {
  return this.options.base_url + '/api/' + this.options.api_version + ('/' === path.charAt(0) ? path : '/' + path);
};

LaMetricCloud.prototype.__request = function(method, path, params) {

  // Build the options to pass to our custom request object
  const options = {
    method: method.toLowerCase(),  // Request method - get || post
    url: this.__buildEndpoint(path) // Generate url
  };

  // Pass url parameters if get
  if ('get' === method) {
    options.qs = params;
  } else {
    options.body = JSON.stringify(params);
  }

  const _this = this;
  return new Promise(function(resolve, reject) {
    _this.request(options, function(error, response, data) {
      // request error
      if (error) {
        return reject(error);
      }

      // JSON parse error or empty strings
      try {
        // An empty string is a valid response
        data = '' === data ? {} : JSON.parse(data);
      } catch(parseError) {
        return reject(new Error('JSON parseError with HTTP Status: ' + response.statusCode + ' ' + response.statusMessage));
      }

      // response object errors
      // This should return an error object not an array of errors
      if (data.errors !== undefined) {
        return reject(data.errors);
      }

      // status code errors
      if(response.statusCode < 200 || response.statusCode > 299) {
        return reject(new Error('HTTP Error: ' + response.statusCode + ' ' + response.statusMessage));
      }

      // no errors
      resolve(data);
    });
  });
};

/**
 * GET
 */
LaMetricCloud.prototype.get = function(url, params) {
  return this.__request('get', url, params);
};

/**
 * POST
 */
LaMetricCloud.prototype.post = function(url, params) {
  return this.__request('post', url, params);
};

/**
 * POST
 */
LaMetricCloud.prototype.put = function(url, params) {
  return this.__request('put', url, params);
};

/**
 * DELETE
 */
LaMetricCloud.prototype.delete = function(url, params) {
  return this.__request('delete', url, params);
};

/**
 * Update widget frames
 *
 * @param {string} widgetId - widget id.
 * @param {array} frames - frames.
 * @param {array} [widgetVersion] - widget version.
 */
LaMetricCloud.prototype.updateWidget = function(widgetId, frames, widgetVersion) {
  return this.post(`dev/widget/update/${widgetId}${ widgetVersion ? '/' + widgetVersion : '' }`, { frames });
};

module.exports = LaMetricCloud;
