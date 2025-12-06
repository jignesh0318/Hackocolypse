// Voice Assistant Service for speech recognition and text-to-speech

type RecognitionCallback = (transcript: string) => void;
type ErrorCallback = (error: string) => void;

interface VoiceAssistantConfig {
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
    onResult?: RecognitionCallback;
    onError?: ErrorCallback;
}

class VoiceAssistantService {
    private recognition: any;
    private synthesis: SpeechSynthesisUtterance | null = null;
    private isListening: boolean = false;
    private isSpeaking: boolean = false;
    private config: VoiceAssistantConfig;

    constructor(config: VoiceAssistantConfig = {}) {
        this.config = {
            language: config.language || 'en-US',
            continuous: config.continuous !== false,
            interimResults: config.interimResults !== false,
            onResult: config.onResult,
            onError: config.onError,
        };

        // Initialize Web Speech API
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.setupRecognition();
        } else {
            console.error('Speech Recognition API not supported');
        }
    }

    private setupRecognition() {
        if (!this.recognition) return;

        this.recognition.language = this.config.language;
        this.recognition.continuous = this.config.continuous;
        this.recognition.interimResults = this.config.interimResults;

        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('Voice listening started');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            console.log('Voice listening ended');
        };

        this.recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript && this.config.onResult) {
                this.config.onResult(finalTranscript.trim());
            }

            return interimTranscript || finalTranscript;
        };

        this.recognition.onerror = (event: any) => {
            const error = event.error;
            console.error('Speech recognition error:', error);
            if (this.config.onError) {
                this.config.onError(error);
            }
        };
    }

    startListening() {
        if (!this.recognition) {
            console.error('Speech Recognition not available');
            return;
        }
        if (!this.isListening) {
            this.recognition.start();
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    speak(text: string, onEnd?: () => void) {
        // Stop current speech
        window.speechSynthesis.cancel();

        this.synthesis = new SpeechSynthesisUtterance(text);
        this.synthesis.lang = this.config.language || 'en-US';
        this.synthesis.rate = 0.9;
        this.synthesis.pitch = 1;
        this.synthesis.volume = 1;

        this.synthesis.onstart = () => {
            this.isSpeaking = true;
        };

        this.synthesis.onend = () => {
            this.isSpeaking = false;
            if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(this.synthesis);
    }

    isCurrentlyListening(): boolean {
        return this.isListening;
    }

    isCurrentlySpeaking(): boolean {
        return this.isSpeaking;
    }

    destroy() {
        if (this.recognition) {
            this.recognition.stop();
        }
        window.speechSynthesis.cancel();
    }
}

export default VoiceAssistantService;
