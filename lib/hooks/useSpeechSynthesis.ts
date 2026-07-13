"use client";

import { useState, useCallback, useRef } from "react";

export function useSpeechSynthesis() {
    const [speakObj, setSpeakObj] = useState<{
        isSpeaking: boolean,
        currentSpeakingId: string | null
    }>({
        isSpeaking: false,
        currentSpeakingId: null
    })

    const speak = useCallback((text: string, id?: string | null) => {
        if (!("speechSynthesis" in window)) return;

        window.speechSynthesis.cancel(); // stop any current speech before starting new

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onstart = () => utteranceStart(id ?? null);
        utterance.onend = () => utteranceEnd();
        utterance.onerror = () => utteranceEnd();

        window.speechSynthesis.speak(utterance);
    }, []);

    const utteranceStart = (id?: string | null): any => {
        const obj = {
            isSpeaking: true,
            currentSpeakingId: id as string | null
        }
        setSpeakObj(obj)
    }

    const utteranceEnd = (): any => {
        setSpeakObj({
            isSpeaking: false,
            currentSpeakingId: null
        })
    }

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        utteranceEnd()
    }, []);

    return { speak, stop, isSpeaking: speakObj.isSpeaking, currentSpeakingId: speakObj.currentSpeakingId };
}