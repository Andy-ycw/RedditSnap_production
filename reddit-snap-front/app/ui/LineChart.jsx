"use client"
import {useEffect, useRef} from "react";
import * as d3 from 'd3';
import * as Plot from '@observablehq/plot' ;

export default function D3Component ( json_obj ) {
    const containerRef = useRef();
    const data = JSON.parse(json_obj.data);
    data.forEach(d => {
        d.time = d3.isoParse(d.observed_tstz);
        d.ups = +d.ups; // Convert value to a number
    });

    useEffect(() => {
        d3.select("#chart").select("svg").remove();
        const plot = Plot.plot({
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
        containerRef.current.append(plot);
    });
    
    return (    
        <div id="#chart" className='flex justify-center' ref={containerRef} />
        
    );
};

