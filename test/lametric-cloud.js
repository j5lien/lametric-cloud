'use strict';

const assert = require('assert');
const nock = require('nock');
const LaMetricCloud = require('../lib/lametric-cloud');
const VERSION = require('../package.json').version;

describe('LaMetricCloud', function() {

  describe('Constructor', function() {
    let defaults = {};
    before(function() {
      defaults = {
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
      };
    });

    it('create new instance', function() {
      const client = new LaMetricCloud();
      assert(client instanceof LaMetricCloud);
    });

    it('auto constructs', function() {
      // eslint-disable-next-line new-cap
      const client = LaMetricCloud();
      assert(client instanceof LaMetricCloud);
    });

    it('has default options', function() {
      const client = new LaMetricCloud();
      assert.deepEqual(
        Object.keys(defaults),
        Object.keys(client.options)
      );
    });

    it('accepts and overrides options', function() {
      const options = {
        base_url: 'http://127.0.0.1:8080',
        power: 'Max',
        request_options: {
          headers: {
            'User-Agent': 'test'
          }
        }
      };

      const client = new LaMetricCloud(options);

      assert(client.options.hasOwnProperty('power'));
      assert.equal(client.options.power, options.power);

      assert.equal(client.options.base_url, options.base_url);

      assert.equal(
        client.options.request_options.headers['User-Agent'],
        options.request_options.headers['User-Agent']
      );
    });

    it('has pre-configured request object', function(next) {
      const client = new LaMetricCloud({
        base_url: 'http://127.0.0.1:8080',
        access_token: '12345',
        request_options: {
          headers: {
            foo: 'bar'
          }
        }
      });

      assert(client.hasOwnProperty('request'));

      nock('http://127.0.0.1:8080').get('/').reply(200);
      client.request.get('http://127.0.0.1:8080/', function(error, response) {

        const headers = response.request.headers;

        assert(headers.hasOwnProperty('foo'));
        assert(headers.foo, 'bar');

        assert.equal(headers['User-Agent'], 'lametric-cloud/' + VERSION);
        assert(headers.hasOwnProperty('X-Access-Token'));
        assert.equal(headers['X-Access-Token'], '12345');

        next();
      });
    });
  });

  describe('Methods', function() {
    describe('__buildEndpoint()', function() {
      let client;

      before(function() {
        client = new LaMetricCloud();
      });

      it('method exists', function() {
        assert.equal(typeof client.__buildEndpoint, 'function');
      });

      it('build url', function() {
        const path = 'dev/widget/update/widgetid';

        assert.throws(
          client.__buildEndpoint,
          Error
        );

        assert.equal(
          client.__buildEndpoint(path),
          `${client.options.base_url}/api/v1/${path}`
        );

        assert.equal(
          client.__buildEndpoint('/' + path),
          `${client.options.base_url}/api/v1/${path}`
        );

        assert.equal(
          client.__buildEndpoint(path + '/'),
          `${client.options.base_url}/api/v1/${path}/`
        );

        assert.equal(
          client.__buildEndpoint(path),
          'https://developer.lametric.com/api/v1/dev/widget/update/widgetid'
        );
      });
    });

    describe('__request()', function(){
      before(function(){
        this.nock = nock('https://developer.lametric.com');
        this.client = new LaMetricCloud();
      });

      it('accepts any 2xx response', function(done) {
        var jsonResponse = {id: 1, name: 'lametric'};
        this.nock.get(/.*/).reply(201, jsonResponse);
        this.client.__request('get', '/dev/widget/update/widgetid')
          .then(data => {
            assert.deepEqual(data, jsonResponse);
            done();
          });
      });

      it('errors when there is an error object', function(done){
        var jsonResponse = {errors: ['nope']};
        this.nock.get(/.*/).reply(203, jsonResponse);
        this.client.__request('get', '/dev/widget/update/widgetid')
          .catch(error => {
            assert.deepEqual(error, ['nope']);
            done();
          });
      });

      it('errors on bad json', function(done) {
        this.nock.get(/.*/).reply(200, 'fail whale');
        this.client.__request('get', '/dev/widget/update/widgetid')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });

      it('allows an empty response', function(done){
        this.nock.get(/.*/).reply(201, '');
        this.client.__request('get', '/dev/widget/update/widgetid')
          .then(data => {
            assert.deepEqual(data, {});
            done();
          });
      });

      it('errors when there is a bad http status code', function(done) {
        this.nock.get(/.*/).reply(500, '{}');
        this.client.__request('get', '/dev/widget/update/widgetid')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });

      it('errors on a request or network error', function(done) {
        this.nock.get(/.*/).replyWithError('something bad happened');
        this.client.__request('get', '/dev/widget/update/widgetid')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });
    });

    describe('get()', function() {
    });

    describe('post()', function() {
    });

    describe('put()', function() {
    });

    describe('delete()', function() {
    });
  });
});
