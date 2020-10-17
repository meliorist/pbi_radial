'use strict'

import powerbi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import PrimitiveValue = powerbi.PrimitiveValue;
import ISelectionId = powerbi.extensibility.ISelectionId;

export let wingData: Array<any>;

export function transformData(options: VisualUpdateOptions, host: IVisualHost) {
    let dataViews = options.dataViews;

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
        wingData = [];
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

}