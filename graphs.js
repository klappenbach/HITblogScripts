/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) val = "0" + val;
                return val;
            };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:    d,
                    dd:   pad(d),
                    ddd:  dF.i18n.dayNames[D],
                    dddd: dF.i18n.dayNames[D + 7],
                    m:    m + 1,
                    mm:   pad(m + 1),
                    mmm:  dF.i18n.monthNames[m],
                    mmmm: dF.i18n.monthNames[m + 12],
                    yy:   String(y).slice(2),
                    yyyy: y,
                    h:    H % 12 || 12,
                    hh:   pad(H % 12 || 12),
                    H:    H,
                    HH:   pad(H),
                    M:    M,
                    MM:   pad(M),
                    s:    s,
                    ss:   pad(s),
                    l:    pad(L, 3),
                    L:    pad(L > 99 ? Math.round(L / 10) : L),
                    t:    H < 12 ? "a" : "p",
                    tt:   H < 12 ? "am" : "pm",
                    T:    H < 12 ? "A" : "P",
                    TT:   H < 12 ? "AM" : "PM",
                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

var posts = new js_cols.RedBlackMap();
var workDates = new js_cols.RedBlackSet();
var DATE_MARKER = "DATE_MARKER";

jQuery(document).ready(function() {

    $.each($('div[class*=HTML] > h2'), function() {
        $(this).click(function() {
            $(this).siblings('div').slideToggle('slow');
        });
        $(this).hover(function() {
            $(this).css('cursor', 'pointer');
        }, function() {
            $(this).css('cursor', 'auto');
        }
                );
        //$(this).prepend("<div style='float: left; margin-right: 10px' class='ui-expandable-icon ui-icon ui-icon-circle-triangle-s'></div>");
        $(this).append("<div style='float: right' class='ui-expandable-icon ui-icon ui-icon-circle-triangle-s'></div>");


    });

    // Find all post dates


    $.each($('.date-header'), function() {
        var div = $(this).parent().get(0);
        //console.log('div: ' +  jQdiv);

        var dateString = $(this).text();
        //console.log('date: ' + dateString);
        var date = new Date(Date.parse(dateString)).format("yyyymmdd");
        posts.insert(date, div);
        //console.log('date after parse: ' + date.toDateString());


    });

    $('.blog-posts').prepend('<ul id="mycarousel" class="jcarousel-skin-tango"/>');
    var lis = $('.date-outer').wrap('<li/>');
    $('#mycarousel').prepend($('li').get().reverse());

    $('.blog-posts').prepend($('<div class="jcarousel-scroll"><form action=""><a href="#" id="mycarousel-prev">&laquo; Prev </a><a href="#" id="mycarousel-next">Next &raquo;</a></form></div>'));

    function mycarousel_initCallback(carousel) {

        jQuery('#mycarousel-next').bind('click', function() {
            carousel.next();
            return false;
        });

        jQuery('#mycarousel-prev').bind('click', function() {
            carousel.prev();
            return false;
        });
    }

    jQuery('#mycarousel').jcarousel({
        // Configuration goes here
        // This tells jCarousel NOT to autobuild prev/next buttons
        buttonNextHTML: null,
        buttonPrevHTML: null,
        initCallback: mycarousel_initCallback,
        visible: 1,
        scroll: 1
    });

});

var options = {
    chart: {
        renderTo: 'container',
        zoomType: 'x',
        spacingRight: 20,
        spacingLeft: 20,
        defaultSeriesType: 'scatter'
    },
    title: {
        text: ''
    },
    subtitle: {
        text: document.ontouchstart === undefined ?
                'Click and drag in the plot area to zoom in' : 'Drag your finger over the plot to zoom in'
    },
    xAxis: {
        type: 'datetime',
        maxZoom: 6 * 24 * 3600000,
        labels: {
            style: {
                fontWeight: 'bold',
                fontSize: '13px'
            }

        }
    },
    yAxis: [
        {
            maxZoom: 20,
            title: {
                text: 'Work: TUL (minutes) * weight (kg)'
            },
            labels: {
                style: {
                    fontWeight: 'bold',
                    fontSize: '13px'
                }
            }
        }
    ],
    tooltip: {
        crosshairs: true,
        shared: true,
        formatter: function() {
            /*            var thisWorkoutDate = new Date(this.x).format("yyyymmdd");
             //console.log("next date: " + workDates.successor(thisWorkoutDate).toLocaleDateString() );
             console.log("dates: " + posts.getValues());
             console.log("keys: " + posts.getKeys());
             console.log("range : " + thisWorkoutDate + " to " + workDates.successor(thisWorkoutDate));
             var range = posts.range(thisWorkoutDate, workDates.successor(thisWorkoutDate));
             console.log(range);
             $.each(range, function() {
             if (this != DATE_MARKER) {
             console.log("current this: " + this);
             if (!$(this).is($('.blog-posts > div:first-child'))) {
             $(this).hide();
             //$(this).clone().prependTo($('.blog-posts'));
             $('.blog-posts').prepend(this);
             $(this).fadeIn(); //.effect("highlight", {}, 3000);
             }
             }
             });*/

            var s = '<span style="font-size: smaller;">' + new Date(this.x).toDateString() + '</span>';

            $.each(this.points, function(i, point) {
                s += '<br/><span style="color: ' + point.series.color + '">' + point.series.name + '</span>: <b>' +
                        point.y + '</b>';
            });

            return s;
        }
    },
    plotOptions: {
        spline: {
            marker: {
                radius: 4,
                lineColor: '#666666',
                lineWidth: 1
            }
        },
        series: {
            allowPointSelect: true,
            cursor: 'pointer',
            lineWidth: 2,
            point: {
                events: {
                    click: function() {
                        hs.htmlExpand(null, {
                            pageOrigin: {
                                x: this.pageX,
                                y: this.pageY
                            },
                            headingText: this.series.name,
                            maincontentText: Highcharts.dateFormat('%A, %b %e, %Y', this.x) + ':<br/> ' +
                                    'work: ' + this.y + (this.weight !== undefined ? '<br/> ' + 'weight: ' + this.weight + ' kg<br/> ' + 'TUL: ' + this.seconds + ' secs' : ""),
                            width: 100
                        });

                    }
                }
            },
            marker: {
                lineWidth: 1
            }
        }
    },
    series: []
};


var workSeries = new js_cols.HashMap();

var averageSerie = new js_cols.HashMap();

var slowDrawGraphs;

if ($.cookie('ImStillHere') == null) {
    slowDrawGraphs = true;
}

$.getJSON("https://spreadsheets.google.com/feeds/list/0Au0hpogKf0qOdFVVMUNrejh2X09jTnBrOVYtNDBKTkE/od7/public/basic?alt=json-in-script&callback=?", function(data) {
    $.each(data.feed.entry, function(no, row) {
        var datePattern = /\d\S*\d{4}/ig;
        var workPattern = /\d+(.\d+)?(?!.)/;
        var dateString = row.content.$t.split(",")[0];
        var workString = row.content.$t.split(",")[1];
        var weightString = row.content.$t.split(",")[2];
        var secondsString = row.content.$t.split(",")[3];
        var date = dateString.match(datePattern).toString();
        var work = Math.floor(parseInt(workString.match(workPattern)) / 60);
        var weight = weightString.match(workPattern);
        var seconds = secondsString.match(workPattern);
        var serieName = row.title.$t;
        var year = date.split("/")[2];
        var month = date.split("/")[0] - 1;
        var day = date.split("/")[1];
        var utcDate = Date.UTC(year, month, day);

        var existingSerie = workSeries.get(serieName, []);
        //"" + year + (month+1) + day
        var formattedDate = new Date(year, month, day).format("yyyymmdd");
        if (posts.get(formattedDate) == null) {
            posts.insert(formattedDate, DATE_MARKER);
        }

        // point
        var dateAndWork = {x: utcDate, y: work, weight: weight, seconds: seconds};

        existingSerie.push(dateAndWork);
        workSeries.insert("" + serieName, existingSerie);

        // average serie
        var existingAVGvalue = averageSerie.get(utcDate, []);
        existingAVGvalue.push(work);
        averageSerie.insert(utcDate, existingAVGvalue);

        var formatted = new Date(utcDate).format("yyyymmdd");
        workDates.insert(formatted, formatted);
    });


    var AVGserie = {
        name: "Average",
        data: [],
        dashStyle: 'shortDot',
        lineWidth: 3,
        animation: {
            easing: 'swing'
        }
    };
    $.each(averageSerie.getKeys(), function(i, date) {
        var sum = 0;
        $.each(averageSerie.get(date), function(i, val) {
            sum += val;
        });
        var AVG = Math.floor(sum / (averageSerie.get(date).length ));
        var point = {x: date, y: AVG};
        AVGserie.data.push(point);
    });

    options.series.push(AVGserie);

    $.each(workSeries.getKeys(), function(i, key) {
        var serie = {
            name: "" + key,
            data: workSeries.get(key)
        };
        options.series.push(serie);


    });
    console.log("after json fetch:");
    console.log(posts.getValues());

    // Create the chart
    var chart = new Highcharts.Chart(options);
});


//setInterval('resetCookie()', 3000);
function resetCookie() {
    var date = new Date();
    date.setTime(date.getTime() + 5 * 1000);
    $.cookie("ImStillHere", "ImStillHere", {expires: date, path: '/'});
}


