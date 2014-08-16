/* 
 * populus.js
 * Main JavaScript code
 *
 * Created by Jayanth Chennamangalam
 */

/* global variables */
var selPulsars = new Array(nPulsars);
var selCount = 0;
var resetZoom = true;

/* options for scatter plot */
var optionsScatter = {
    chart: {
        renderTo: "chart",
        type: "scatter",
        zoomType: "xy",
        resetZoomButton: {
            position: {
                align: "right",
                verticalAlign: "top"
            }
        },
        events: {
            selection: function(event) {
                event.preventDefault();
                /* if CTRL key is pressed, user is selecting points */
                try {
                    if (event.originalEvent.ctrlKey         /* ctrl key */
                        || event.originalEvent.metaKey) {   /* command key */
                        for (var i = 0; i < this.series[0].data.length; ++i) {
                            var point = this.series[0].data[i];
                            if (point.x > event.xAxis[0].min
                                && point.x < event.xAxis[0].max
                                && point.y > event.yAxis[0].min
                                && point.y < event.yAxis[0].max) {
                                point.select(true, true);
                            }
                        }
                    }
                    /* else, user is zooming */
                    else
                    {
                        this.xAxis[0].setExtremes(event.xAxis[0].min,
                                                  event.xAxis[0].max);
                        this.yAxis[0].setExtremes(event.yAxis[0].min,
                                                  event.yAxis[0].max);
                        if (resetZoom) {
                            /* the 'restZoom' flag is required because
                               showing and hiding the button doesn't seem to
                               work with multiple levels of zooming */
                            this.showResetZoom();
                            resetZoom = false;
                        }
                    }
                } catch (exception) {
                    /* kludgy way to make reset zoom work */
                    if (exception.message.indexOf("ctrlKey") > -1) {
                        this.xAxis[0].setExtremes(null, null);
                        this.yAxis[0].setExtremes(null, null);
                        if (!resetZoom) {
                            this.resetZoomButton.hide();
                            resetZoom = true;
                        }
                    }
                }
                return false;
            },
            click: function(event) {
                /* deselect all points if clicked on background */
                for (var i = 0; i < selCount; ++i) {
                    this.series[0].data[selPulsars[i]].select(false, false);
                }
                selCount = 0;
                return;
            }
        }
    },
    title: {
        text: ""
    },
    xAxis: {
        title: {
            enabled: true,
        },
        startOnTick: false,
        endOnTick: false,
        showLastLabel: true
    },
    yAxis: {
        title: {
            enabled: true,
        },
        startOnTick: false,
        endOnTick: false,
        showLastLabel: true
    },
    plotOptions: {
        scatter: {
            allowPointSelect: true,
            marker: {
                radius: 4
            },
            color: "#006600"
        },
        series: {
            point: {
                events: {
                    mouseOver: function() {
                        $("#tooltip").html("<b>"
                            + psrcat["name"][this.psrIdx] + "</b>: "
                            /* TODO: add parameter names */
                            + this.x.toFixed(2) + ", " + this.y.toFixed(2));
                    },
                    mouseOut: function() {
                        $("#tooltip").html("&nbsp;");
                    },
                    select: function(event) {
                        //console.log(this.series.data.indexOf(this));
                        selPulsars[selCount++] = this.psrIdx;
                    }
                }
            }
        }
    },
    tooltip: {
        enabled: false,
        crosshairs: [true, true]
        /*useHTML: true,
        formatter: function() {
            return "<b>" + psrcat["name"][this.point.psrIdx] + "</b><br />"
                   + this.x.toFixed(2) + ", " + this.y.toFixed(2);
        }*/
    }
};

/* options for histogram */
var optionsHistogram = {
    chart: {
        renderTo: "chart",
        type: "column",
    },
    title: {
        text: ""
    },
    xAxis: {
        title: {
            enabled: true,
        },
        startOnTick: false,
        endOnTick: false,
        showLastLabel: true
    },
    yAxis: {
        title: {
            enabled: true,
        },
        startOnTick: false,
        endOnTick: false,
        showLastLabel: true
    },
    plotOptions: {
        column: {
            color: "#006600", 
            pointPadding: 0,
            groupPadding: 0,
            borderWidth: 0, 
            shadow: false,
            dataLabels: {
                enabled: true
            }
        }
    },
    tooltip: {
        enabled: false,
    }
};

/* main plotting function */
function plot() {
    if (!$("#chart").is(":empty")) {        /* replot */
        $("#chart").highcharts().destroy();
    }

    /* query checkboxes and get selected data */
    var retSel = getSelectedData();
    if (-1 == retSel.retVal) {
        chart.hideLoading();
        return;
    }

    /* only one checkbox is checked, so plot a histogram */
    if (1 == retSel.data.length) {
        var chart = new Highcharts.Chart(optionsHistogram);
        chart.showLoading();

        /* sort array */
        data = retSel.data[0].sort(function (a, b) {
            return a > b ? 1 : a < b ? -1 : 0;
        });

        /* bin data */
        var numBins = 20;
        var j = 0;
        /* get minimum non-NaN value */
        var dataMin = 0.0;
        while (isNaN(data[j])) {
            ++j;
        }
        dataMin = data[j];
        /* get maximum non-NaN value */
        var dataMax = 0.0;
        j = data.length - 1;
        while (isNaN(data[j])) {
            --j;
        }
        dataMax = data[j];
        //var binWidth = (data[data.length-1] - data[0]) / numBins;
        var binWidth = (dataMax - dataMin) / numBins;
        console.log(data);
        console.log(binWidth);
        var binEdge = dataMin + binWidth;
        console.log(binEdge);
        var y = Array.apply(null, new Array(numBins)).map(Number.prototype.valueOf, 0);
        var plotData = new Array(numBins);
        j = 0;
        var k = 0;
        var blah = 0;
        for (var i = 0; i < data.length; ++i) {
            if (isNaN(data[i])) {
                continue;
            }
            if (data[i] <= binEdge) {
                ++y[j];
                ++blah;
                plotData[j] = [binEdge, blah];
            } else {
                console.log(i, data[i], binEdge, j, y[j]);
                if (numBins - 1 == j) {
                    blah = 0;
                    break;
                }
                ++j;
                blah = 0;
                ++y[j];
                ++blah;
                plotData[j] = [binEdge, blah];
                binEdge += binWidth;
            }
            ++k;
        }
        console.log(y);
        console.log(plotData.length);
        console.log(plotData);
        chart.addSeries({
            data: plotData
        });
        chart.xAxis[0].setTitle({ text: retSel.label[0] }); 
        chart.hideLoading();
        /* clear status message on success */
        $("#status").html("Plotted histogram for " + k + " pulsars."
                          + "<sup></sup><br />&nbsp;");
    } else {                            /* 2D scatter plot */
        var chart = new Highcharts.Chart(optionsScatter);
        chart.showLoading();

        var op = getPlotOptions();

        /* get scope */
        var scope = $("input[name=scope]:radio:checked").val();
        var retPlot = scatterize(retSel.data[0], retSel.data[1], op, scope);
        if (-1 == retPlot.retVal) {
            chart.hideLoading();
            return;
        }

        chart.addSeries({
            data: retPlot,
            turboThreshold: 3000
        });
        chart.xAxis[0].setTitle({ text: retSel.label[0] }); 
        chart.yAxis[0].setTitle({ text: retSel.label[1] }); 
        xExtremes = chart.xAxis[0].getExtremes();
        yExtremes = chart.yAxis[0].getExtremes();
        chart.xAxis[0].setExtremes(xExtremes.dataMin,
                                   xExtremes.dataMax);
        chart.yAxis[0].setExtremes(yExtremes.dataMin,
                                   yExtremes.dataMax);
        chart.hideLoading();
        /* clear status message on success */
        $("#status").html("Plotted " + retPlot[0].numPoints + " pulsars."
                          + "<sup></sup><br />&nbsp;");
        /* reset selection if all pulsars plotted successfully */
        for (var i = 0; i < selCount; ++i) {
            selPulsars[i] = null;
        }
        selCount = 0;
    }

    return;
}
function getSelectedData() {
    var checkedCount = $("#params input:checked").length;
    if (1 == checkedCount) {        /* histogram */
        var data = new Array();
        var label = new Array();
        /* TODO: find a cleaner way to do this than call each() */
        $("#params input:checked").each(function() {
            data[0] = psrcat[$(this).val()];
            label[0] = $(this).val();
        });
        return {retVal: 0, data: data, label: label};
    } else if (2 == checkedCount) { /* scatter plot */
        var data = new Array(2);
        var label = new Array(2);
        var i = 0;
        $("#params input:checked").each(function() {
            data[i] = psrcat[$(this).val()];
            label[i] = $(this).val();
            ++i;
        });
        return {retVal: 0, data: data, label: label};
    } else {
        $("#status").html("ERROR: Invalid number of parameters ("
                          + checkedCount
                          + ")!<sup></sup><br />"
                          + "Number of parameters must be 2.");
        return {retVal: -1, data: null};
    }
}
function getPlotOptions() {
    var op = "";
    if ($("#log10x").prop("checked") && $("#log10y").prop("checked")) {
        op = "log10log10";
    } else if ($("#log10x").prop("checked") && !$("#log10y").prop("checked")) {
        op = "semilog10x";
    } else if (!$("#log10x").prop("checked") && $("#log10y").prop("checked")) {
        op = "semilog10y";
    }
    return op;
}
function scatterize(x, y, op, scope) {
    //var math = mathjs();
    var xopd = new Array();
    var yopd = new Array();
    var psrIdx = new Array();
    var j = 0;

    if (("useSel" == scope) && (0 == selCount)) {
        $("#status").html("ERROR: No pulsars selected!<sup></sup><br />"
                          + "&nbsp;");
        return {retVal: -1, numPoints: 0, x: null, y: null, psrIdx: null};
    }

    for (var i = 0; i < nPulsars; ++i) {
        if ("useSel" == scope) {
            if (j == selCount) {
                break;
            }
            if ($.inArray(i, selPulsars) < 0)
            {
                continue;
            }
        }
        if (!isNaN(x[i]) && !isNaN(y[i])) {
            if ("log10log10" == op) {
                /* TODO: indicate spin-up (-ve p1) somehow in the plot */
                if (x[i] > 0.0 && y[i] > 0.0) {
                    xopd[j] = math.log10(x[i]);
                    yopd[j] = math.log10(y[i]);
                    psrIdx[j] = i;
                    ++j;
                }
            } else if ("semilog10x" == op) {
                if (x[i] > 0.0) {
                    xopd[j] = math.log10(x[i]);
                    yopd[j] = y[i];
                    psrIdx[j] = i;
                    ++j;
                }
            } else if ("semilog10y" == op) {
                if (y[i] > 0.0) {
                    yopd[j] = math.log10(y[i]);
                    xopd[j] = x[i];
                    psrIdx[j] = i;
                    ++j;
                }
            } else {
                xopd[j] = x[i];
                yopd[j] = y[i];
                psrIdx[j] = i;
                ++j;
            }
        }
    }

    var plotData = $.map(xopd, function (xopd, idx) {
        //return [[xopd, yopd[idx]]];
        /* TODO: fix this - no need for retVal and numPoints in the array,
                 take them out */
        return {retVal: 0,
                numPoints: j,
                x: xopd,
                y: yopd[idx],
                psrIdx: psrIdx[idx]};
    });
    //return {data: xy, psrIdx: psrIdx};
    return plotData;
}

function showHelp(tag) {
    var helpText = "";

    /* parameters */
    if ("pmra" == tag.text) {
        helpText = "Proper motion in right ascenscion, "
                   + "in mas yr.<sup>-1</sup>";
    } else if ("pmdec" == tag.text) {
        helpText = "Proper motion in declination, in mas yr.<sup>-1</sup>";
    } else if ("rajd" == tag.text) {
        helpText = "Right ascension in deg.";
    } else if ("decjd" == tag.text) {
        helpText = "Declination in deg.";
    } else if ("gl" == tag.text) {
        helpText = "Galactic longitude in deg.";
    } else if ("gb" == tag.text) {
        helpText = "Galactic latitude in deg.";
    } else if ("pml" == tag.text) {
        helpText = "Proper motion in Galactic longitude, "
                   + "in mas yr.<sup>-1</sup>";
    } else if ("pmb" == tag.text) {
        helpText = "Proper motion in Galactic latitude, "
                   + "in mas yr.<sup>-1</sup>";
    } else if ("dm" == tag.text) {
        helpText = "Dispersion measure in cm<sup>-3</sup> pc";
    } else if ("p0" == tag.text) {
        helpText = "Period in s";
    } else if ("p1" == tag.text) {
        helpText = "First time derivative of period in s s<sup>-1</sup>";
    } else if ("s400" == tag.text) {
        helpText = "Flux density in mJy, at 400 MHz";
    } else if ("s1400" == tag.text) {
        helpText = "Flux density in mJy, at 1400 MHz";
    } else if ("w50" == tag.text) {
        helpText = "Pulse width at 50% of the peak value";
    } else if ("w10" == tag.text) {
        helpText = "Pulse width at 10% of the peak value";
    } else if ("spindx" == tag.text) {
        helpText = "Measured spectral index";
    } else if ("rm" == tag.text) {
        helpText = "Rotation measure in rad m<sup>-2</sup>";
    } else if ("tau_sc" == tag.text) {
        helpText = "Temporal broadening at 1 GHz, in s";
    } else if ("dm1" == tag.text) {
        helpText = "First time derivative of DM, "
                   + "in cm<sup>-3</sup> pc yr.<sup>-1</sup>";
    } else if ("pb" == tag.text) {
        helpText = "Binary period in days";
    } else if ("dist" == tag.text) {
        helpText = "Best estimate of distance in kpc";
    } else if ("dist1" == tag.text) {
        helpText = "Best estimate of distance based on DM and NE2001 model, "
                   + "in kpc";
    } else if ("age" == tag.text) {
        helpText = "Spin-down age in yr.";
    }
    /* plot options */
    else if ("log(x)" == tag.text) {
        helpText = "Plot x-axis in log<sub>10</sub> scale";
    } else if ("log(y)" == tag.text) {
        helpText = "Plot y-axis in log<sub>10</sub> scale";
    } else if ("All" == tag.text) {
        helpText = "Plot all pulsars for which both parameters "
                   + "have known values";
    } else if ("Selected" == tag.text) {
        helpText = "Plot selected pulsars for which both parameters "
                   + "have known values";
    }
    helpText = helpText + "<sup></sup><br />&nbsp;";

    $("#status").html(helpText);

    return;
}

function showHelpPage() {
    //$("#status").empty();
    $("#status").animate({
            height: $(document).height() - 91
        },
        500,
        function() {
            /* animation complete, so show help */
            helpText =
"<p>Populus is a visualizing front-end for the \
<a href=\"http://www.atnf.csiro.au/people/pulsar/psrcat/\">ATNF Pulsar \
Catalogue</a>. It displays scatter plots for any combination of supported \
pulsar parameters for which data are available.</p>\
\
<p>To create a scatter plot, choose two parameters from the 'Parameters' \
section of the page, and click the 'Plot' button. Hovering the mouse pointer \
on a plotted point shows the name of the pulsar and the x and y axis values \
for that pulsar, above the plot. To zoom into a particular region, click and \
drag around the region of interest. To select pulsars, either control-click \
on the pulsars that you want to choose, or control-click-and-drag an area \
around them (in the case of Macs, use command-click or command-click-and-drag \
instead). To plot all pulsars in the catalogue for which values of both \
parameters are available, select the 'All' radio button (this is the default \
option). To create a scatter plot of only the selected pulsars, click the \
'Selected' radio button, choose parameters, and click 'Plot'.</p>\
\
<p>To plot the x-axis (or y-axis) in log<sub>10</sub> scale, check the \
'log(x)' (or 'log(y)') checkbox and click 'Plot'.</p>\
\
<p>To create a histogram, choose one parameter and click the 'Plot' \
button.</p>\
\
<p>To see what each parameter or plot option is, click on the checkbox or \
radio button label. The explanation is displayed on the status bar at the \
bottom of the page.</p>\
\
<button id=\"buttonOK\" onClick=\"hidePage()\">OK</button>";

            $("#status").html(helpText);
        });

        return;
}

function showAboutPage() {
    $("#status").animate({
            height: $(document).height() - 91
        },
        500,
        function() {
            /* animation complete, so show help */
            aboutText =
"<p>Populus uses version " + psrcatVersion
+ " of the ATNF Pulsar Catalogue, with " + nPulsars + " pulsars.</p>\
\
<p>Created by Jayanth Chennamangalam.</p>\
\
<button id=\"buttonOK\" onClick=\"hidePage()\">OK</button>";

            $("#status").html(aboutText);
        });

        return;
}

function hidePage() {
    $("#status").animate({
            height: "40px"
        },
        500,
        function() {
            $("#status").empty();
        });

    return;
}

