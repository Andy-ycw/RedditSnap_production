"use client"
import {useEffect, useRef, useState} from "react";
import * as d3 from 'd3';
import * as Plot from '@observablehq/plot' ;

export default function D3Component ( json_obj ) {
    const containerRef = useRef();
    const data = JSON.parse(json_obj.data)
    data.forEach(d => {
        d.observed_tstz = d3.isoParse(d.observed_tstz);
        d.ups = +d.ups; // Convert value to a number
    });

    useEffect(() => {
        d3.select("#chart").select("svg").remove();
        const plot = Plot.plot({
            marks: [
            Plot.dot(data, {x: "observed_tstz", y: "ups", stroke: "blue"})
            ]
        });
        containerRef.current.append(plot);
    }, []);
    
    return <div id="#chart" className='flex justify-center' ref={containerRef} />;
};

