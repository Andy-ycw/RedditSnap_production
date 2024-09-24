"use client"
import {useEffect, useRef} from "react";
import * as d3 from 'd3';
import * as Plot from '@observablehq/plot' ;

export default function LineChart ( json_obj ) {
    const containerRef = useRef(0);
    const data = JSON.parse(json_obj.data);
    data.forEach(d => {
        d.time = d3.isoParse(d.observed_tstz);
        d.ups = +d.ups; // Convert value to a number
    });
    
    useEffect(() => {
        const chart_dom = containerRef.current;
        const plot = Plot.plot({
            marginLeft:60,
            marginRight:60,
            grid: true,
            x: {type: `time`, tickFormat: `%I %p\n%b%e`},   
            marks: [
                Plot.lineY(data, {x: "time", y: "ups", stroke: "blue",
                    tip: {
                        format: {
                            y: d => d,
                            x: d => d.toLocaleString('en-US', { timeZone: 'Australia/Melbourne' }),
                        }
                    },
                })
            ]
        });

        chart_dom.append(plot);
        return () => {chart_dom.innerHTML = ""}
        
    });
    
    return (    
        <div id="#chart" className='flex justify-center' ref={containerRef} />
    );
};

