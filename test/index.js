import dateMath from '../lib/index';
import _ from 'lodash';
import moment from 'moment';
import sinon from 'sinon';
import expect from 'expect.js';

describe('dateMath', function () {
  // Test each of these intervals when testing relative time
  var spans = ['s', 'm', 'h', 'd', 'w', 'M', 'y', 'ms'];
  var anchor =  '2014-01-01T06:06:06.666Z';
  var unix = moment(anchor).valueOf();
  var format = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
  let clock;

  describe('errors', function () {
    it('should return undefined if passed something falsy', function () {
      expect(dateMath.parse()).to.be(undefined);
    });

    it('should return undefined if I pass an operator besides [+-/]', function () {
      expect(dateMath.parse('now&1d')).to.be(undefined);
    });

    it('should return undefined if I pass a unit besides' + spans.toString(), function () {
      expect(dateMath.parse('now+5f')).to.be(undefined);
    });

    it('should return undefined if rounding unit is not 1', function () {
      expect(dateMath.parse('now/2y')).to.be(undefined);
      expect(dateMath.parse('now/0.5y')).to.be(undefined);
    });

    it('should not go into an infinite loop when missing a unit', function () {
      expect(dateMath.parse('now-0')).to.be(undefined);
      expect(dateMath.parse('now-00')).to.be(undefined);
      expect(dateMath.parse('now-000')).to.be(undefined);
    });

  });

  describe('objects and strings', function () {
    let mmnt;
    let date;
    let string;
    let now;

    beforeEach(function () {
      clock = sinon.useFakeTimers(unix);
      now = moment();
      mmnt = moment(anchor);
      date = mmnt.toDate();
      string = mmnt.format(format);
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return the same moment if passed a moment', function () {
      expect(dateMath.parse(mmnt)).to.eql(mmnt);
    });

    it('should return a moment if passed a date', function () {
      expect(dateMath.parse(date).format(format)).to.eql(mmnt.format(format));
    });

    it('should return a moment if passed an ISO8601 string', function () {
      expect(dateMath.parse(string).format(format)).to.eql(mmnt.format(format));
    });

    it('should return the current time if passed now', function () {
      expect(dateMath.parse('now').format(format)).to.eql(now.format(format));
    });
  });

  describe('subtraction', function () {
    let now;
    let anchored;

    beforeEach(function () {
      clock = sinon.useFakeTimers(unix);
      now = moment();
      anchored = moment(anchor);
    });

    afterEach(function () {
      clock.restore();
    });

    _.each([5, 12, 247], function (len) {
      _.each(spans, function (span) {
        var nowEx = `now-${len}${span}`;
        var thenEx =  `${anchor}||-${len}${span}`;

        it('should return ' + len + span + ' ago', function () {
          expect(dateMath.parse(nowEx).format(format)).to.eql(now.subtract(len, span).format(format));
        });

        it('should return ' + len + span + ' before ' + anchor, function () {
          expect(dateMath.parse(thenEx).format(format)).to.eql(anchored.subtract(len, span).format(format));
        });
      });
    });
  });

  describe('addition', function () {
    let now;
    let anchored;

    beforeEach(function () {
      clock = sinon.useFakeTimers(unix);
      now = moment();
      anchored = moment(anchor);
    });

    afterEach(function () {
      clock.restore();
    });

    _.each([5, 12, 247], function (len) {
      _.each(spans, function (span) {
        var nowEx = `now+${len}${span}`;
        var thenEx =  `${anchor}||+${len}${span}`;

        it('should return ' + len + span + ' from now', function () {
          expect(dateMath.parse(nowEx).format(format)).to.eql(now.add(len, span).format(format));
        });

        it('should return ' + len + span + ' after ' + anchor, function () {
          expect(dateMath.parse(thenEx).format(format)).to.eql(anchored.add(len, span).format(format));
        });
      });
    });
  });

  describe('rounding', function () {
    let now;

    beforeEach(function () {
      clock = sinon.useFakeTimers(unix);
      now = moment();
    });

    afterEach(function () {
      clock.restore();
    });

    _.each(spans, function (span) {
      it('should round now to the beginning of the ' + span, function () {
        expect(dateMath.parse('now/' + span).format(format)).to.eql(now.startOf(span).format(format));
      });

      it('should round now to the end of the ' + span, function () {
        expect(dateMath.parse('now/' + span, true).format(format)).to.eql(now.endOf(span).format(format));
      });
    });
  });

});
