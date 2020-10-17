/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;
import * as d3 from 'd3';
import { wingData, transformData } from './data';

import { VisualSettings } from "./settings";
import { ScaleOrdinal } from "d3";
export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private host: IVisualHost;
    private container: HTMLElement;

    constructor(options: VisualConstructorOptions) {
        //console.log('Visual constructor', options);
        this.target = options.element;
        this.host = options.host;
        if (document) {
            this.container = document.createElement('div');
            this.container.setAttribute('id', 'radius-container');
            this.target.appendChild(this.container);
        }
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

console.log(options.dataViews);

        let h = options.viewport.height;
        let w = options.viewport.width;

        // allows us to use the colors from the selected template
        let colorPalette: ISandboxExtendedColorPalette = this.host.colorPalette;

        transformData(options, this.host);
        console.log(wingData);
/*
        let data_view = options.dataViews[0].table;

        let role_map = [];
        for (let dv = 0; dv < data_view.columns.length; dv++) {
            if (data_view.columns[dv].roles.segments == true) role_map['segments'] = dv;
            if (data_view.columns[dv].roles.layers == true) role_map['layers'] = dv;
            if (data_view.columns[dv].roles.data_values == true) role_map['data_values'] = dv;
        }

        let segment_array:Array<any> = [];
        for (let row = 0; row < data_view.rows.length; row++) {
          segment_array[data_view.rows[row][role_map['segments']] as string] = [];
        }
        for (let row = 0; row < data_view.rows.length; row++) {
          let mrow:Array<any> = segment_array[data_view.rows[row][role_map['segments'] as string]];
          mrow.push([data_view.rows[row][role_map['layers']] as string, data_view.rows[row][role_map['data_values']] as number]);
        }
        //console.log(segment_array);
        let wingData:Array<any> = [];
        var segment_keys = Object.keys(segment_array);
        let sTotal:number = 0;
        for(var i = 0; i < segment_keys.length;i++) {
            let segment_arr = {};
            segment_arr["month"] = segment_keys[i];
            sTotal = 0;
            for(var s = 0; s < segment_array[segment_keys[i]].length; s++) {
                segment_arr[segment_array[segment_keys[i]][s][0]] = segment_array[segment_keys[i]][s][1];
                sTotal+= segment_array[segment_keys[i]][s][1] as number;
            }
            segment_arr["total"] = sTotal;
            wingData.push(segment_arr);
        }
        console.log(wingData);

        let wingDataOld:Array<any> = [
            { "month": "Jan", "AZ": 6, "SC": 40, "NC": 56, "total": 102 },
            { "month": "Feb", "AZ": 3, "SC": 59, "NC": 99, "total": 161 },
            { "month": "Mar", "AZ": 6, "SC": 55, "NC": 76, "total": 137 },
            { "month": "Apr", "AZ": 6, "SC": 46, "NC": 69, "total": 121 },
            { "month": "May", "AZ": 12, "SC": 89, "NC": 88, "total": 189 },
            { "month": "Jun", "AZ": 8, "SC": 122, "NC": 74, "total": 204 },
            { "month": "Jul", "AZ": 11, "SC": 113, "NC": 70, "total": 194 },
            { "month": "Aug", "AZ": 14, "SC": 64, "NC": 55, "total": 133 },
            { "month": "Sep", "AZ": 7, "SC": 55, "NC": 69, "total": 131 },
            { "month": "Oct", "AZ": 7, "SC": 39, "NC": 61, "total": 238 },
            { "month": "Nov", "AZ": 8, "SC": 72, "NC": 75, "total": 155 },
            { "month": "Dec", "AZ": 11, "SC": 54, "NC": 46, "total": 111 }
        ];
        console.log(wingDataOld);
*/

        let arc_interval = 100; // animation time for each arc

        let svg = d3.select(this.container)
            .append("svg")
            .attr("class","radial-class")
            .attr("width", w)
            .attr("height", h);

        let key_count = d3.keys(wingData[0]).length;
        let wings = d3.keys(wingData[0]).slice(1, key_count - 1);
        
        let outerRadius:number = (d3.min([h, (w - 40)]) / 2);
        let innerRadius: number = outerRadius * .4;

        let rScale = d3.scaleLinear()
            .domain([0, d3.max(wingData, d => d.total)])
            .range([innerRadius, outerRadius]);

        let wingStack = d3.stack().keys(wings)(wingData)
            .map(d => (d.forEach(v => v['key'] = d.key), d));

            let color = d3.scaleOrdinal()
            .domain(wingStack.map(d => d.key))
            .range(d3.schemeCategory10)
            .unknown("#ccc")
  
          let interval_count: number = wingStack[0].length; // normally will be 12, one for each month

        let pie = d3.pie()
            .value(function (d, i) { return i + 1; });

        let yTicksValues = d3.ticks(0, d3.max(wingData, d => d.total), 4);

        // Arcs for the donut
        svg.append("g")
            .selectAll("g")
            .data(wingStack)
            .enter().append("g")
            .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")")
            .attr("fill", "white")
            .selectAll("path")
            .data(function (d) { return d; })
            .enter().append("path")
            .attr("id", function (d, i) { return "arc_" + wings.indexOf(d['key']) + "_" + i; })
            .attr("d", <any>d3.arc()
              .innerRadius(function (d) { return rScale(d[0]); })
              .outerRadius(function (d) { return rScale(d[1]); })
              .startAngle(function (d, i) { return ((Math.PI * 2) / interval_count) * i })
              .endAngle(function (d, i) { return ((Math.PI * 2) / interval_count) * (i + 1) }))
            .transition()
            .duration(2400)
            .ease(d3.easeLinear)
            .attr("fill", d => <string>color(d['key']))
            .delay(function (d, i) {
                return (
                    ((wings.indexOf(d['key']) * (interval_count * arc_interval)) + (i * arc_interval))
                )
            });

        // lines dividing the months
        svg.append("g")
            .selectAll("g")
            .data(pie(wingData))
            .enter().append("g")
            .attr("stroke", "purple")
            .append("line")
            .attr('x1', function (d, i) { return (Math.cos(((Math.PI * 2) / interval_count) * (i + 1)) * innerRadius) + outerRadius; })
            .attr('y1', function (d, i) { return (Math.sin(((Math.PI * 2) / interval_count) * (i + 1)) * innerRadius) + outerRadius; })
            .attr('x2', function (d, i) { return (Math.cos(((Math.PI * 2) / interval_count) * (i + 1)) * outerRadius) + outerRadius; })
            .attr('y2', function (d, i) { return (Math.sin(((Math.PI * 2) / interval_count) * (i + 1)) * outerRadius) + outerRadius; });

        // month labels
        svg.selectAll(".monthText")
            .data(pie(wingData))
            .enter().append("text")
            .attr("class", "month-text")
            .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")")
            .attr("dy", -5)
            .append("textPath")
            .attr("xlink:href", function (d, i) { return "#arc_0_" + i; })
            .style("text-anchor", "middle")
            .attr("startOffset", "75%")
            .text(function (d) { return d.data['month']; });

        // Category labels
        svg.selectAll(".category-text")
            .data(wingStack)
            .enter()
            .append("text")
            .attr("class", "category-text")
            .attr("x", outerRadius - ((innerRadius - 20) / 2))
            .attr("y", outerRadius + 14)
            .attr("height", 40)
            .attr("width", innerRadius - 20)
            .text(function (d, i) { return d['key']; })
            .attr("stroke", d => colorPalette.getColor(d['key'] as string).value)
            .attr("fill", d => colorPalette.getColor(d['key'] as string).value)
            .attr("opacity", 0)
            .transition()
            .duration(interval_count * arc_interval)
            .ease(d3.easeLinear)
            .attr("opacity", 1)
            .delay(function (d, i) { return i * (interval_count * arc_interval) })
            .transition()
            .duration(arc_interval)
            .ease(d3.easeLinear)
            .attr("opacity", 0);

        // concentric circles showing scale values
        var yAxis = svg.append("g")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

        var yTick = yAxis
            .selectAll("g")
            .data(yTicksValues)
            .enter().append("g");

        yTick.append("circle")
            .attr("fill", "none")
            .attr("stroke", "#ccdcea")
            .attr("r", function (d) { return +rScale(d); });

        yTick.append("text")
            .attr("y", function (d) { return +rScale(d); })
            .attr("dy", "0.35em")
            .attr("fill", "none")
            .attr("stroke", "#fff")
            .attr("stroke-width", 5)
            .text(function (d) { return d; });

        yTick.append("text")
            .attr("y", function (d) { return +rScale(d); })
            .attr("dy", "0.35em")
            .text(function (d) { return d; });

        // legend
        svg.selectAll(".legend")
            .data(wingStack)
            .enter()
            .append("text")
            .attr("class", "legend-text")
            .attr("x", w - 40)
            .attr("y", function (d,i) { return (i * 20) + 40; })
            .attr("height", 40)
            .attr("width", 40)
            .text(function (d) { return d['key']; })
            .attr("stroke", d => colorPalette.getColor(d['key'] as string).value)
            .attr("fill", d => colorPalette.getColor(d['key'] as string).value)
            .attr("opacity", 0)
            .transition()
            .duration(interval_count * arc_interval)
            .ease(d3.easeLinear)
            .attr("opacity", 1)
            .delay(function (d, i) { return i * (interval_count * arc_interval) });

        // cross hairs

        svg.append("line")
            .style('stroke', '#dcdcdc')
            .attr('x1', 0)
            .attr('y1', outerRadius)
            .attr('x2', w)
            .attr('y2', outerRadius);

        svg.append("line")
            .style('stroke', '#dcdcdc')
            .attr('x1', outerRadius)
            .attr('y1', 0)
            .attr('x2', outerRadius)
            .attr('y2', h);


    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}