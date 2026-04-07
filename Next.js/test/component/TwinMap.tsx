"use client"

import DeckGL from "@deck.gl/react";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

export default function TwinMap({linkData, trafficData, bitData}: any ) {
    const INITIAL_VIEW = {
        longitude: 129.1317,
        latitude: 35.1695,
        zoom: 11,
        pitch: 45,  // 3D 각
        bearing: 0, // 지도 회전 각
    };

    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <DeckGL initialViewState={INITIAL_VIEW} controller={true}>
                <Map mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}/>
            </DeckGL>
        </div>
    )
}