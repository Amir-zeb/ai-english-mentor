"use client";

import { useState, useEffect, useCallback } from "react";

const COOKIE_NAME = "autoSpeak";

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
}

function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export function useAutoSpeakPreference() {
    const [autoSpeak, setAutoSpeakState] = useState(false);

    useEffect(() => {
        setAutoSpeakState(getCookie(COOKIE_NAME) === "true");
    }, []);

    const setAutoSpeak = useCallback((value: boolean) => {
        setAutoSpeakState(value);
        setCookie(COOKIE_NAME, String(value));
    }, []);

    return { autoSpeak, setAutoSpeak };
}