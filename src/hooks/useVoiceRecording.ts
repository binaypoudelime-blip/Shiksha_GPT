import { useState, useRef } from 'react';

export const useVoiceRecording = (onTranscription: (text: string) => void) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const audioDataRef = useRef<Float32Array[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            // Resume context if suspended
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            // ScriptProcessorNode is deprecated but widely compatible for simple sampling
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            audioDataRef.current = [];

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                audioDataRef.current.push(new Float32Array(inputData));
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Could not access microphone. Please ensure you have given permission.');
        }
    };

    const stopRecording = async () => {
        if (!isRecording) return;

        setIsRecording(false);

        if (audioDataRef.current.length === 0) {
            alert('No audio captured');
            return;
        }

        setIsTranscribing(true);

        try {
            if (processorRef.current) {
                processorRef.current.disconnect();
                processorRef.current = null;
            }
            if (audioContextRef.current) {
                // Check if audioContext is still running before closing
                if (audioContextRef.current.state !== 'closed') {
                    await audioContextRef.current.close();
                }
                audioContextRef.current = null;
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            const wavBlob = encodeWAV(audioDataRef.current, 16000);
            await sendToTranscribe(wavBlob);
        } catch (error) {
            console.error('Error stopping recording:', error);
        } finally {
            setIsTranscribing(false);
        }
    };

    const sendToTranscribe = async (blob: Blob) => {
        try {
            console.log('Audio captured! Size:', (blob.size / 1024).toFixed(2), 'KB');
            const token = localStorage.getItem("access_token");
            console.log('Sending transcription request with token status:', !!token);
            const formData = new FormData();
            formData.append('file', blob, 'recording.wav');

            const response = await fetch('https://shiksha-gpt.com/api/transcribe/', {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Transcription response data:', data);
                if (data.results && data.results.length > 0) {
                    onTranscription(data.results[0].transcript);
                }
            } else {
                const errorText = await response.text();
                console.error('Transcription failed:', errorText);
            }
        } catch (error) {
            console.error('Error sending audio to transcribe:', error);
        }
    };

    const encodeWAV = (samples: Float32Array[], sampleRate: number) => {
        const flatSamples = flattenArray(samples);
        const buffer = new ArrayBuffer(44 + flatSamples.length * 2);
        const view = new DataView(buffer);

        /* RIFF identifier */
        writeString(view, 0, 'RIFF');
        /* file length */
        view.setUint32(4, 36 + flatSamples.length * 2, true);
        /* RIFF type */
        writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, 1, true);
        /* sample rate */
        view.setUint32(24, sampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, sampleRate * 2, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, 2, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, flatSamples.length * 2, true);

        floatTo16BitPCM(view, 44, flatSamples);

        return new Blob([view], { type: 'audio/wav' });
    };

    const flattenArray = (channelBuffer: Float32Array[]) => {
        const result = new Float32Array(channelBuffer.reduce((acc, b) => acc + b.length, 0));
        let offset = 0;
        for (const buffer of channelBuffer) {
            result.set(buffer, offset);
            offset += buffer.length;
        }
        return result;
    };

    const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
        for (let i = 0; i < input.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    };

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    return {
        isRecording,
        isTranscribing,
        startRecording,
        stopRecording
    };
};
