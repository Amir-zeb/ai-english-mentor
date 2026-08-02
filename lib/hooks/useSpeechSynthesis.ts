"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export function useSpeechSynthesis(): {
    speak: (text: string, id?: string | null, voiceURI?: string) => void;
    stop: () => void;
    isSpeaking: boolean;
    currentSpeakingId: string | null;
} {
    const [speakObj, setSpeakObj] = useState<{
        isSpeaking: boolean;
        currentSpeakingId: string | null;
    }>({
        isSpeaking: false,
        currentSpeakingId: null
    })
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            voicesRef.current = availableVoices;
        };

        loadVoices();

        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const speak = useCallback((text: string, id?: string | null, voiceURI: string = '') => {
        if (!("speechSynthesis" in window)) return;

        window.speechSynthesis.cancel(); // stop any current speech before starting new

        const utterance = new SpeechSynthesisUtterance(text);

        const availableVoices = voicesRef.current;

        const voice = voiceURI
            ? availableVoices.find((v) => v.voiceURI === voiceURI)
            : availableVoices[0];

        if (voice) {
            utterance.voice = voice;
        }

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