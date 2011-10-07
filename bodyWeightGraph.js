var optionsBW = {
    chart: {
        renderTo: 'bodyWeightContainer',
        defaultSeriesType: 'spline',
        zoomType: 'x',
        spacingRight: 20,
        spacingLeft: 20

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
            labels: {
                formatter: function() {
                    return this.value + ' kg';
                },
                style: {
                    fontWeight: 'bold',
                    fontSize: '13px',
                    color: '#DB843D'
                }
            },
            title: {
                text: ''
            }

        },
        {
            labels: {
                formatter: function() {
                    return this.value + ' cm';
                },
                style: {
                    fontWeight: 'bold',
                    fontSize: '13px'
                }
            },
            title: {
                text: ''
            },
            opposite: true
        }
    ],
    tooltip: {
        crosshairs: true,
        shared: true
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
                                /*'weight: ' +*/ this.y /*+  " kg"*/,
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

// Create the chart
var chartBW = new Highcharts.Chart(optionsBW);

var bodyWeightSeries = new js_cols.HashMap();
/*
var slowDrawGraphs;

if($.cookie('ImStillHere') == null) {
    slowDrawGraphs = true;
}
*/

$.getJSON("https://spreadsheets.google.com/feeds/list/0Au0hpogKf0qOdFVVMUNrejh2X09jTnBrOVYtNDBKTkE/odb/public/basic?alt=json-in-script&callback=?", function(data) {
    $.each(data.feed.entry, function(no, row) {
        var datePattern = /\d\S*\d{4}/ig;
        var valuePattern = /\d+(.\d+)?/;
        var dateString = row.content.$t.split(",")[0];
        var valueString = row.content.$t.split(",")[1];
        var date = dateString.match(datePattern).toString();
        var weight = valueString.match(valuePattern);
        var serieName = row.title.$t;
        var year = date.split("/")[2];
        var month = date.split("/")[0] - 1;
        var day = date.split("/")[1];
        var utcDate = Date.UTC(year, month, day);

        var existingSerie = bodyWeightSeries.get(serieName, []);

        var dateAndBodyWeight = [utcDate , parseFloat(weight)];
        existingSerie.push(dateAndBodyWeight);
        bodyWeightSeries.insert("" + serieName, existingSerie);

    });


    $.each(bodyWeightSeries.getKeys(), function(i, key) {
        var serieName = "" + key;
        var serie = {
            name: serieName ,
            data: bodyWeightSeries.get(key),
            yAxis: serieName === "Weight"? 0: 1,
            color:  serieName === "Weight"? '#DB843D': undefined
        };
        setTimeout(function() {
            chartBW.addSeries(serie);
        }, slowDrawGraphs? 8000: 0);
    });


});



