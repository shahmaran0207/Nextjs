"use client"

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { useEffect, useState } from "react";

export default function ApiDocs() {
    const [ spec, setSpec ] = useState(null);

    useEffect(() => {
        fetch("/api/swagger")
            .then(res => res.json())
            .then(data => setSpec(data));
    }, []);

    if (!spec) return <div>Loading...</div>
    return <SwaggerUI spec={spec} />;
}