/*!
 * xpCalendar v1.0.0-devel
 * Docs & License: https://github.com/KirkeWeb/xpCalendar
 * Author: Victor Duarte (zvictor.net)
 * (c) 2014 KirkeWeb ApS
 */


  //====================\\
 // Dependency injection \\
//---------------------------------------------------------------------------------------------------------------------\
(function(factory) {
  if (typeof define === 'function' && define.amd)
    define([ 'jquery', 'moment' ], factory);
  else if(typeof require === 'function')
    factory(require('jquery'), require('moment'));
  else
    factory(jQuery, moment);
})(function($, moment) {

 //=================\\
//      Helpers      \\
//---------------------------------------------------------------------------------------------------------------------\
  var helper = {
    inherit: function(proto, propertiesObject) {
      if (typeof Object.create === 'function')
        return Object.create(proto, propertiesObject);

      var F = function () {};
      if (arguments.length > 1)
        throw Error('Second argument not supported');
      if (proto === null)
        throw Error('Cannot set a null [[Prototype]]');
      if (typeof proto != 'object')
        throw TypeError('Argument must be an object');
      F.prototype = proto;
      return new F();
    },
    absRound: function(number) {
      return (number < 0) ? Math.ceil(number) : Math.floor(number);
    },
    builder: function(name, getter, setter) {
      Instant.prototype[name] = function(value) {
        if(value === undefined)
          return getter.apply(this._date, arguments);

        setter.apply(this._date, arguments);
        return this;
      }
    }
  };

  //==================\\
 // Instant definition \\
//---------------------------------------------------------------------------------------------------------------------\
  function Instant(input) {
    if(!Instant.isValidDate(input))
      throw new Error("xpCalendar.Instant does not accept non Date input.");

    this._date = input;

    return this;
  }

  //Checks if a given input is a valid Date instance
  Instant.isValidDate = function(input) {
    // @see http://stackoverflow.com/a/24953063/599991
    if(!(input && input.getTimezoneOffset && input.setUTCFullYear))
      return false;

    var time = input.getTime();
    return time === time;
  };

  function makeInstant(args, parseAsUTC, parseZone) {
    // parseAsUTC and parseZone are ignored in our Instant object
    // Instant does not deal with zones.
    var input;
    var output; // an object with fields for the new Instant object

    if((Array.isArray && Array.isArray(args)) || Object.prototype.toString.call(args) === '[object Array]')
      // call from fullcalendar
      input = args[0];
    else if(args === Object(args))
      // moment 'config' object
      input = args._i;

    if(input === undefined)
      output = new Date();
    else if(Instant.isValidDate(input))
      output = input;
    else if(input instanceof Instant)
      return input.clone();
    else
      output = new Date(input);

    return new Instant(output);
  }

  //==================\\
 // Instant prototype  \\
//---------------------------------------------------------------------------------------------------------------------\
  helper.builder('day', Date.prototype.getDate, Date.prototype.setDate);
  helper.builder('date', Date.prototype.getDate, Date.prototype.setDate);
  helper.builder('hours', Date.prototype.getHours, Date.prototype.setHours);
  helper.builder('minutes', Date.prototype.getMinutes, Date.prototype.setMinutes);
  helper.builder('seconds', Date.prototype.getSeconds, Date.prototype.setSeconds);
  helper.builder('milliseconds', Date.prototype.getMilliseconds, Date.prototype.setMilliseconds);

  //Checks if it is a valid "moment". Called externally only.
  Instant.prototype.isValid = function() {
    // Since we have already checked the validity of the data when we created the instance,
    // it should always return true.
    return true;
  };

  // Returns if the moment has a non-ambiguous time (boolean)
  Instant.prototype.hasTime = function() {
    // We are zone agnostic, so we always return true.
    return true;
  };

  Instant.prototype.clone = function () {
    //@see http://jsperf.com/clone-date-object
    return new Instant(new Date(this._date.getTime()));
  };

  // Strips out its time-of-day.
  Instant.prototype.stripTime = function() {
    this._date = new Date(this._date.getFullYear(), this._date.getMonth(), this._date.getDay(), 0, 0, 0, 0);
    return this;
  };

  // Is the moment within the specified range? `end` is exclusive.
  Instant.prototype.isWithin = function(start, end) {
    return this._date >= start.date && this._date < end.date;
  };

  Instant.prototype.toString = function( ){
    throw new Error("who is using this?"); // TODO! remove this line.
    return this._date.toString();
  };

  Instant.prototype.startOf = function(unit) {
    // the following switch intentionally omits break keywords
    // to utilize falling through the cases.
    if(unit === 'month' || unit === 'months')
      this._date.setDate(1);
    else if(unit === 'week' || unit === 'weeks')
      this.weekday(0);
    else
      throw new Error("Not implement yet xpCalendar.Instant.startOf for unit "+unit);

    return this;
  };

  Instant.prototype.weekday = function(input) {
    var weekday = this.day() % 7;
    return input == null ? weekday : this.add('days', input - weekday);
  };

  Instant.prototype.add = function(unit, quantity) {
    // This method adds miliseconds to a Date instance to reach the desired new Date.
    // After that, smaller units than the one given are reset back to ensure consistency.
    // @see http://stackoverflow.com/a/15825317/599991
    if(quantity === 0)
      return this;

    var copy = new Date(this._date.getTime());

    if(unit === 'days') {
      copy.setTime(copy.getTime() + (quantity * 86400000/* 24h in ms */))
      copy = new Date(copy.getFullYear(), copy.getMonth(), copy.getDate(),
        this._date.getHours(), this._date.getMinutes(), this._date.getSeconds());
    } else if(unit === 'months') {
      var month = copy.getMonth();
      var year = copy.getYear();

      month = (month + quantity) % 12;
      if (0 > month) {
        year += (copy.getMonth() + quantity - month - 12) / 12;
        month += 12;
      }
      else
        year += ((copy.getMonth() + quantity - month) / 12);

      copy.setMonth(month);
      copy.setYear(year);
    } else
      throw new Error("Not implement yet xpCalendar.Instant.add for unit "+unit);

    this._date = copy;
    return this;
  };

  // Getter: returns a Duration with the hours/minutes/seconds/ms values of the moment.
  // Setter: you can supply a Duration, a Moment, or a Duration-like argument.
  Instant.prototype.time = function(time) {
    // Todo! Do we need a moment.duration? How bad is the performance of it?
    // Todo! Improve the performance of this method.
    if (time === undefined) { // getter //TODO! should it be compared against null or undefined?
      return moment.duration({
        hours: this.hours(),
        minutes: this.minutes(),
        seconds: this.seconds(),
        milliseconds: this.milliseconds()
      });
    }
    else { // setter
      if (!moment.isDuration(time) && !moment.isMoment(time))
        time = moment.duration(time);

      // The day value should cause overflow (so 24 hours becomes 00:00:00 of next day).
      // Only for Duration times, not Moment times.
      var dayHours = 0;
      if (moment.isDuration(time))
        dayHours = Math.floor(time.asDays()) * 24;

      // We need to set the individual fields.
      // Can't use startOf('day') then add duration. In case of DST at start of day.
      return this.hours(dayHours + time.hours())
        .minutes(time.minutes())
        .seconds(time.seconds())
        .milliseconds(time.milliseconds());
    }
  };

  Instant.prototype.diff = function(that, unit, asFloat) {
    if (unit === 'year' || unit === 'month')
      throw new Error("Not implement xpCalendar.Instant.diff for units 'year' and ' month' yet");

    var diff = (this._date.getTime() - that.date.getTime());
    var output = unit === 'second' ? diff / 1e3 : // 1000
        unit === 'minute' ? diff / 6e4 : // 1000 * 60
        unit === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
        unit === 'day' ? diff / 864e5 : // 1000 * 60 * 60 * 24
        unit === 'week' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7
      diff;
    return asFloat ? output : helper.absRound(output);
  };

  //==================\\
 //  momentjs wrapping \\
//---------------------------------------------------------------------------------------------------------------------\
// A momentjs method should be called when it cannot be found at xpCalendar
  for (var key in moment)
    if (moment.hasOwnProperty(key) /*&& typeof moment[key] === 'function'*/ && !Instant.hasOwnProperty(key))
      makeInstant[key] = (function(method) {
        return function() {
          return method.apply(this, arguments);
        };
      })(moment[key]);

  var momentProto = moment.fn; // alternatively: moment().constructor.prototype;
  for (var key in momentProto)
    if (momentProto.hasOwnProperty(key) && typeof momentProto[key] === 'function' && !Instant.hasOwnProperty(key))
      Instant.prototype[key] = (function(method) {
        return function () {
          var output = method.apply(moment(this._date), arguments);
          this._date = output._d;
          return output;
        };
      })(momentProto[key]);

  //==================\\
 // External overrides \\
//---------------------------------------------------------------------------------------------------------------------\
// Replaces fullCalendar's moment by xpCalendar's Instant.
  var fc = $.fullCalendar;
  if(fc === undefined) {
    if (typeof require === 'function')
      console.log("Warning: fullCalendar could not be found and xpcalendar was not applied.");
    else
      throw new Error("fullCalendar could not be found. It must be loaded before you load xpCalendar");
  } else {
    fc.moment = function () {
      return makeInstant(arguments);
    };

    fc.moment.parseZone = function () {
      return makeInstant(arguments, true, true);
    };
  }

  var oldFormat =  moment.fn.format;
  moment.fn.format = function() {
    // xpCalendar has to override the moment.format to make it compatible with xpCalendar.Instant.
    // It is due to the fact that we do not have access to how fullCalendar calls moment.format.
    if(this instanceof Instant)
      return oldFormat.apply(moment(this._date), arguments);

    return oldFormat.apply(this, arguments);
  };

  //============\\
 //    Export    \\
//---------------------------------------------------------------------------------------------------------------------\
  var globalScope = typeof global !== 'undefined' ? global : this;

  if (typeof module !== 'undefined' && module.exports)
    module.exports = makeInstant;
  else if (typeof define === 'function' && define.amd) {
    define('Instant', function (require, exports, module) {
      return makeInstant;
    });
    globalScope.instant = makeInstant;
  } else
    globalScope.instant = makeInstant;
//=====================================================================================================================/
});


/*
 * Some interesting benchmark tests relevant to this library:
   - http://jsperf.com/store-date-string-or-integer
   - http://jsperf.com/new-date-vs-date-now-vs-performance-now/6
 *
 */
