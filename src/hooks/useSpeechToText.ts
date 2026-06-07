import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

type WebSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult:
    | ((e: {
        results: { [i: number]: { [j: number]: { transcript: string }; isFinal?: boolean } };
        resultIndex: number;
      }) => void)
    | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function useSpeechToText(onTranscript: (text: string, isFinal: boolean) => void) {
  const [listening, setListening] = useState(false);
  const [available, setAvailable] = useState(false);
  const onTranscriptRef = useRef(onTranscript);
  const webRecRef = useRef<WebSpeechRecognition | null>(null);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    setAvailable(ExpoSpeechRecognitionModule.isRecognitionAvailable());
  }, []);

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    const isFinal = event.isFinal ?? false;
    if (text) onTranscriptRef.current(text, isFinal);
  });
  useSpeechRecognitionEvent('error', () => setListening(false));

  const stop = useCallback(() => {
    if (Platform.OS === 'web') {
      webRecRef.current?.stop();
      webRecRef.current = null;
    } else {
      ExpoSpeechRecognitionModule.stop();
    }
    setListening(false);
  }, []);

  const start = useCallback(async () => {
    if (Platform.OS === 'web') {
      const W = window as Window & {
        SpeechRecognition?: new () => WebSpeechRecognition;
        webkitSpeechRecognition?: new () => WebSpeechRecognition;
      };
      const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
      if (!SR) return;
      const rec = new SR();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.continuous = true;
      rec.onresult = (e) => {
        const idx = e.resultIndex;
        const t = e.results[idx];
        if (t?.[0]) onTranscriptRef.current(t[0].transcript, !!t.isFinal);
      };
      rec.onend = () => {
        setListening(false);
        webRecRef.current = null;
      };
      rec.onstart = () => setListening(true);
      webRecRef.current = rec;
      rec.start();
      return;
    }

    const perms = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perms.granted) return;
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: true,
    });
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { listening, available, start, stop, toggle };
}
