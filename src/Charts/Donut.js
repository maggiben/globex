///////////////////////////////////////////////////////////////////////////////
// @file         : donut.js                                                  //
// @summary      : D3 Donut Chart                                            //
// @version      : 0.1                                                       //
// @project      : apicat.us                                                 //
// @description  : D3 Donut for apicatus UI                                  //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 15 Nov 2014                                               //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2013~2014 Benjamin Maggi <benjaminmaggi@gmail.com>              //
//                                                                           //
//                                                                           //
// License:                                                                  //
// Permission is hereby granted, free of charge, to any person obtaining a   //
// copy of this software and associated documentation files                  //
// (the "Software"), to deal in the Software without restriction, including  //
// without limitation the rights to use, copy, modify, merge, publish,       //
// distribute, sublicense, and/or sell copies of the Software, and to permit //
// persons to whom the Software is furnished to do so, subject to the        //
// following conditions:                                                     //
//                                                                           //
// The above copyright notice and this permission notice shall be included   //
// in all copies or substantial portions of the Software.                    //
//                                                                           //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   //
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF                //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.    //
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY      //
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,      //
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE         //
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

var charts = charts || {};

charts.donut = function module() {
    'use strict';

    var width = 200,
        height = 200,
        duration = 650,
        ease = 'cubic-in-out',
        textOffset = 14;
    var svg,
        donut = d3.layout.pie(),
        container = null,
        innerArcs = null,
        outterArcs = null,
        phantomArcs = null,
        totalValue = null;
    ///////////////////////////////////////////////////////////////////////////
    // DOM Element                                                           //
    ///////////////////////////////////////////////////////////////////////////
    var graph;

    ///////////////////////////////////////////////////////////////////////////
    // objects to be populated with data later                               //
    ///////////////////////////////////////////////////////////////////////////
    var pieData = [];
    var oldPieData = [];
    var filteredPieData = [];

    ///////////////////////////////////////////////////////////////////////////
    // Events                                                                //
    ///////////////////////////////////////////////////////////////////////////
    var dispatch = d3.dispatch('click', 'mouseover', 'mousemove', 'mouseout');

    var color = d3.scale.ordinal()
        .range(["#00acac", "#348FE1", "#ff5b57", "#f59c1a", "#727cb6", "#49b6d6", "#348fe2"]);

    ///////////////////////////////////////////////////////////////////////////
    // Default chart options                                                 //
    ///////////////////////////////////////////////////////////////////////////
    var options = {
        chart: {
            type: 'pie',
            margin: {top: 0, right: 0, bottom: 0, left: 0}
        },
        plotOptions: {
            labels: false,
            summary: false,
            pie: {
                outerRadius: 100,
                innerRadius: 45
            },
            series: {
                animation: false,
                units: null
            }
        }
    };

    ///////////////////////////////////////////////////////////////////////////
    // Module                                                                //
    ///////////////////////////////////////////////////////////////////////////
    function exports(_selection) {
        _selection.each(function(_data) {
            if(!_data) {
                return;
            }
            graph = this;

            // D3 helper function to populate pie slice parameters from array data
            donut = d3.pie().value(function(d) {
                return d.value;
            });

            var arc = d3.svg.arc();
            var arcPhantom = d3.svg.arc();
            var arcOutter = d3.svg.arc();

            function draw(data) {
                var size = {
                    'width': width - options.chart.margin.left - options.chart.margin.right,
                    'height': height - options.chart.margin.top - options.chart.margin.bottom
                };

                var radius = Math.min(size.width, size.height) / 2;
                ///////////////////////////////////////////////////////////////////////////
                // Arc functions                                                         //
                ///////////////////////////////////////////////////////////////////////////
                arc
                    .innerRadius(radius * (options.plotOptions.pie.innerRadius / 100))
                    .outerRadius(radius * (options.plotOptions.pie.outerRadius / 100) - 10);

                arcOutter
                    .innerRadius(radius * (options.plotOptions.pie.outerRadius / 100) - 10)
                    .outerRadius(radius * (options.plotOptions.pie.outerRadius / 100));

                arcPhantom
                    .innerRadius(0)
                    .outerRadius((radius * (options.plotOptions.pie.outerRadius / 100)) + 20);

                ///////////////////////////////////////////////////////////////////////////
                // Create SVG element                                                   //
                ///////////////////////////////////////////////////////////////////////////
                if(!svg) {
                    svg = d3.select(graph)
                        .append('svg')
                        .attr('preserveAspectRatio', 'xMidYMid meet')
                        .attr('viewBox', '0 0 ' + size.width + ' ' + size.height)
                        .attr('width', '100%')
                        .attr('height', '100%');

                    // Group for arcs/paths
                    innerArcs = svg.append('g')
                        .attr('class', 'arc')
                        .attr('transform', 'translate(' + (size.width / 2) + ',' + (size.height / 2) + ')');

                    //Set up outter arc groups
                    outterArcs = svg.append("g")
                        .attr("class", "outter-arc")
                        .style('pointer-events', 'none')
                        .attr("transform", 'translate(' + (size.width / 2) + ',' + (size.height / 2) + ')');

                    // Set up phantom arc groups
                    phantomArcs = svg.append("g")
                        .attr("class", "phantom-arc")
                        .style('pointer-events', 'none')
                        .attr("transform", 'translate(' + (size.width / 2) + ',' + (size.height / 2) + ')');

                    //GROUP FOR CENTER TEXT
                    var center_group = svg.append('svg:g')
                        .attr('class', 'center_group')
                        .attr('transform', 'translate(' + (size.width / 2) + ',' + (size.height / 2) + ')');

                    //Placeholder gray circle
                    innerArcs.append('svg:circle')
                        .attr('fill', '#EFEFEF')
                        .attr('r', arc.outerRadius());

                    // White circle behind labels
                    var whiteCircle = center_group.append('svg:circle')
                        .attr('fill', 'white')
                        .attr('r', arc.innerRadius());

                    // HTML Label Container
                    var foreignObject = center_group.append('foreignObject')
                            .attr('width', options.plotOptions.pie.outerRadius)
                            .attr('height', options.plotOptions.pie.outerRadius)
                            .attr('y', -(options.plotOptions.pie.outerRadius / 2))
                            .attr('x', -(options.plotOptions.pie.outerRadius / 2))
                        .append("xhtml:body")
                            .attr('class', 'html-object')
                            .style("margin",0)
                            .style("padding",0)
                            .style('line-height', options.plotOptions.pie.outerRadius + 'px');
                    totalValue = foreignObject.append("p")
                            .attr('class', 'label')
                            .html('<span class="text">Waiting...</span>');
                }

                ///////////////////////////////////////////////////////////
                // to run each time data is generated                    //
                ///////////////////////////////////////////////////////////
                function update() {
                    // Remove placeholder circle
                    innerArcs.selectAll('circle').remove();
                    // Get total sessions
                    var total = data.series[0].data.reduce(function(previousValue, currentValue) {
                        return previousValue + currentValue.value;
                    }, 0);
                    // Set default text
                    totalValue.html('<span class="text">' + data.series[0].name + '</span><br /><span class="value">' + total + '</span><br /><span class="text">sessions</span>');

                    // Draw arc paths
                    var inner = innerArcs.selectAll('path').data(donut(data.series[0].data));
                    inner.enter().append('path')
                        .attr('class', 'slice')
                        .style('fill-opacity', 0.25)
                        .style('fill', function(d, i) {
                            return d.data.fill || color(i);
                        })
                        .on('mouseover', function(d){
                            totalValue.html('<span class="text">' + d.data.name + '</span> <span class="value">' + d.value + '</span>');
                        })
                        .on('mouseout', function(d){
                            totalValue.html('<span class="text">' + data.series[0].name + '</span><br /><span class="value">' + total + '</span><br /><span class="text">sessions</span>');
                        })
                        .on('click', dispatch.click);
                    inner
                        .transition()
                        .duration(duration)
                        .attrTween('d', function(d, i) {
                            return pieTween(d, i, arc);
                        });
                    inner.exit()
                        .transition()
                        .duration(duration)
                        .attrTween('d', function(d, i){
                            return removePieTween(d, i, arc);
                        })
                        .remove();

                    ///////////////////////////////////////////////////////////
                    // Draw outter arc paths                                 //
                    ///////////////////////////////////////////////////////////
                    var outter = outterArcs.selectAll('path').data(donut(data.series[0].data));
                    outter.enter().append('path')
                        .style('fill', function(d, i) {
                            return d.data.fill || color(i);
                        });
                    outter
                        .transition()
                        .duration(duration)
                        .attrTween('d', function(d, i){
                            return pieTween(d, i, arcOutter);
                        });
                    outter.exit()
                        .transition()
                        .duration(duration)
                        .attrTween('d', function(d, i){
                            return removePieTween(d, i, arcOutter);
                        })
                        .remove();

                    ///////////////////////////////////////////////////////////
                    // Draw phantom arc paths                                //
                    ///////////////////////////////////////////////////////////
                    var phantom = phantomArcs.selectAll('path').data(donut(data.series[0].data));
                    phantom.enter().append('path')
                        .style('fill', 'white')
                        .style('fill-opacity', 0.1)
                        .style('stroke', 'white')
                        .style('stroke-width', 5);
                    phantom
                        .transition()
                        .duration(duration)
                        .attrTween('d', function(d, i){
                            return pieTween(d, i, arcPhantom);
                        });
                    phantom.exit()
                        .transition()
                        .duration(duration)
                        .attrTween('d', function(d, i){
                            return removePieTween(d, i, arcPhantom);
                        })
                        .remove();
                }

                if(data.series[0].data.length) {
                    update();
                }
            }

            ///////////////////////////////////////////////////////////
            // Interpolate the arcs in data space.                   //
            ///////////////////////////////////////////////////////////
            function pieTween(d, i, func) {
                var s0;
                var e0;
                if (oldPieData[i]) {
                    s0 = oldPieData[i].startAngle;
                    e0 = oldPieData[i].endAngle;
                } else if (!(oldPieData[i]) && oldPieData[i - 1]) {
                    s0 = oldPieData[i - 1].endAngle;
                    e0 = oldPieData[i - 1].endAngle;
                } else if (!(oldPieData[i - 1]) && oldPieData.length > 0) {
                    s0 = oldPieData[oldPieData.length - 1].endAngle;
                    e0 = oldPieData[oldPieData.length - 1].endAngle;
                } else {
                    s0 = 0;
                    e0 = 0;
                }
                i = d3.interpolate({
                    startAngle: s0,
                    endAngle: e0
                }, {
                    startAngle: d.startAngle,
                    endAngle: d.endAngle
                });
                return function(t) {
                    var b = i(t);
                    return func(b);
                };
            }
            function removePieTween(d, i, func) {
                s0 = 2 * Math.PI;
                e0 = 2 * Math.PI;
                i = d3.interpolate({
                    startAngle: d.startAngle,
                    endAngle: d.endAngle
                }, {
                    startAngle: s0,
                    endAngle: e0
                });
                return function(t) {
                    var b = i(t);
                    return func(b);
                };
            }

            draw(_data);
        });
    }
    ///////////////////////////////////////////////////////////////
    // Option accessors                                          //
    ///////////////////////////////////////////////////////////////
    exports.options = function(opt) {
        // Need deep copy !
        options = $.extend(true, {}, options, opt);
        return this;
    };
    exports.width = function(_x) {
        if (!arguments.length) {
            return width;
        }
        width = parseInt(_x, 10);
        return this;
    };
    exports.height = function(_x) {
        if (!arguments.length) {
            return height;
        }
        height = parseInt(_x, 10);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
