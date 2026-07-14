"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type UseSpeechRecognitionReturn = {
    isListening: boolean;
    isSupported: boolean;
    startListening: () => void;
    stopListening: () => void;
};

export function useSpeechRecognition(
    onResult: (text: string) => void,
    onError?: (error: string) => void
): UseSpeechRecognitionReturn {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }
        setIsSupported(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            setIsListening(false);
            onError?.(event.error);
        };

        recognitionRef.current = recognition;
    }, [onResult, onError]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            recognitionRef.current.start();
            setIsListening(true);
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    return { isListening, isSupported, startListening, stopListening };
}