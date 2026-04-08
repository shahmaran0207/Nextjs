import { useEffect, useState, useRef } from "react";
import { SignalData } from "@/types/signal";

export function useSignalPolling(itstId: string | null, intervalMs = 5000 ) {
    const [ signal, setSignal ] = useState<SignalData | null>(null);

    const timerRef = useRef<ReturnType <typeof setInterval> | null>(null);

    useEffect(() => {
        if(!itstId) {
            setSignal(null);
            return;
        };

        const fetchSignal =async() => {
            try {
                const res = await fetch(`/api/SeoulSignal?itstId=${itstId}`);

                if(!res.ok) return;

                const data = await res.json();
                setSignal(data.item);
            } catch(err) {
                console.error("TOD Signal Pooling Error::::::::::::", err);
            }
        };

        fetchSignal();
        timerRef.current = setInterval(fetchSignal, intervalMs);

        return () => {
            if(timerRef.current) clearInterval(timerRef.current);
        };
    }, [itstId]);

    return signal;
}