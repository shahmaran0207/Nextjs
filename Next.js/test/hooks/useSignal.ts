'use client'

import { useState, useEffect, useCallback } from "react"
import { SignalResponse } from "@/types/signal"

interface UseSignalOptions {
    itstId?: string
    pageNo?: number
    numOfRows?: number
    pollingInterval?:number
};

export function useSignal ({
    itstId, pageNo = 1,
    numOfRows = 10, pollingInterval=5000,
}: UseSignalOptions={}) {
    const [ data, setData ] = useState<SignalResponse | null>(null);
    const [ loading, setLoading ] = useState(true);

    const fetchSignal = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                pageNo: String(pageNo),
                numOfRows: String(numOfRows),
            });

            if (itstId) params.set('itstId', itstId);

            const res = await fetch(`/api/signal?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const json: SignalResponse = await res.json();
            setData(json);
        } catch(err) {
            console.error("fetchSignalError:::::::::::::::", err);
        } finally {
            setLoading(false);
        }
    }, [itstId, pageNo, numOfRows]);

    useEffect(() => {
        fetchSignal();
        if(!pollingInterval) return;
        const id = setInterval(fetchSignal, pollingInterval);
        return () => clearInterval(id);
    }, [fetchSignal, pollingInterval])

    return { data, loading };
}