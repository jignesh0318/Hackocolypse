// Voice-Activated SOS Service using Web Speech API
// Triggers emergency SOS by voice commands

interface VoiceSOSOptions {
  keywords?: string[];
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onMatch?: (keyword: string) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'listening' | 'stopped' | 'error') => void;
}

class VoiceSOSService {
  private recognition: any = null;
  private isListening = false;
  private keywords: string[] = ['help me', 'emergency', 'help', 'code red', 'mayday'];
  private language = 'en-US';
  private continuous = true;
  private interimResults = true;
  private onMatch: ((keyword: string) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private onStatusChange: ((status: 'listening' | 'stopped' | 'error') => void) | null = null;
  private matchThreshold = 0.85; // 85% confidence for keyword match

  constructor(options: VoiceSOSOptions = {}) {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('❌ Web Speech API not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.configure(options);
    this.setupEventListeners();
  }

  private configure(options: VoiceSOSOptions) {
    if (options.keywords && options.keywords.length > 0) {
      this.keywords = options.keywords.map(k => k.toLowerCase());
    }
    if (options.language) this.language = options.language;
    if (options.continuous !== undefined) this.continuous = options.continuous;
    if (options.interimResults !== undefined) this.interimResults = options.interimResults;
    if (options.onMatch) this.onMatch = options.onMatch;
    if (options.onError) this.onError = options.onError;
    if (options.onStatusChange) this.onStatusChange = options.onStatusChange;

    // Configure recognition
    this.recognition.language = this.language;
    this.recognition.continuous = this.continuous;
    this.recognition.interimResults = this.interimResults;
    this.recognition.maxAlternatives = 5;
  }

  private setupEventListeners() {
    // When speech recognition starts
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('🎙️ Voice recognition started...');
      this.onStatusChange?.('listening');
    };

    // When results come in
    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase();
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          console.log(`✅ Final: "${transcript}" (${(confidence * 100).toFixed(0)}%)`);
        } else {
          interimTranscript += transcript;
          console.log(`🔄 Interim: "${transcript}"`);
        }
      }

      // Check if any keyword matched in final transcript
      if (finalTranscript) {
        this.checkForKeywords(finalTranscript, event.results[event.results.length - 1][0].confidence);
      }
    };

    // Handle errors
    this.recognition.onerror = (event: any) => {
      const errorMessage = `Speech recognition error: ${event.error}`;
      console.error('❌', errorMessage);
      this.onError?.(event.error);
      this.onStatusChange?.('error');
    };

    // When recognition ends
    this.recognition.onend = () => {
      this.isListening = false;
      console.log('⏹️ Voice recognition stopped');
      this.onStatusChange?.('stopped');
    };
  }

  private checkForKeywords(transcript: string, confidence: number) {
    const words = transcript.split(/\s+/).filter(w => w.length > 0);

    // Check for exact keyword match
    for (const keyword of this.keywords) {
      const keywordWords = keyword.split(/\s+/);
      
      // Check if keyword appears in transcript
      for (let i = 0; i <= words.length - keywordWords.length; i++) {
        const phraseSlice = words.slice(i, i + keywordWords.length).join(' ');
        
        // Exact match
        if (phraseSlice === keyword) {
          console.log(`🚨 KEYWORD MATCHED: "${keyword}" (${(confidence * 100).toFixed(0)}%)`);
          this.onMatch?.(keyword);
          return;
        }

        // Fuzzy match (account for speech recognition errors)
        if (this.fuzzyMatch(phraseSlice, keyword)) {
          console.log(`🚨 KEYWORD MATCHED (fuzzy): "${keyword}" (matched: "${phraseSlice}")`);
          this.onMatch?.(keyword);
          return;
        }
      }
    }
  }

  private fuzzyMatch(text1: string, text2: string): boolean {
    // Levenshtein distance for fuzzy matching
    const str1 = text1.toLowerCase();
    const str2 = text2.toLowerCase();
    
    if (str1 === str2) return true;
    
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (Math.abs(len1 - len2) > 2) return false; // Too different
    
    let matches = 0;
    for (let i = 0; i < Math.min(len1, len2); i++) {
      if (str1[i] === str2[i]) matches++;
    }
    
    const matchPercentage = matches / Math.max(len1, len2);
    return matchPercentage >= this.matchThreshold;
  }

  // Public methods
  public start() {
    if (!this.recognition) {
      console.error('Web Speech API not supported');
      return false;
    }

    if (this.isListening) {
      console.log('Already listening');
      return true;
    }

    try {
      this.recognition.start();
      console.log('🎙️ Starting voice recognition...');
      return true;
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      return false;
    }
  }

  public stop() {
    if (!this.recognition) return;

    try {
      this.recognition.stop();
      console.log('⏹️ Stopping voice recognition...');
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
    }
  }

  public abort() {
    if (!this.recognition) return;
    this.recognition.abort();
    this.isListening = false;
  }

  public setKeywords(keywords: string[]) {
    this.keywords = keywords.map(k => k.toLowerCase());
    console.log('📝 Keywords updated:', this.keywords);
  }

  public getKeywords(): string[] {
    return this.keywords;
  }

  public setLanguage(language: string) {
    this.language = language;
    this.recognition.language = language;
    console.log('🌍 Language updated:', language);
  }

  public isActive(): boolean {
    return this.isListening;
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public getStatus(): 'idle' | 'listening' | 'error' {
    if (!this.recognition) return 'error';
    return this.isListening ? 'listening' : 'idle';
  }

  public getSupportedLanguages(): string[] {
    return [
      'en-US', 'en-GB', 'en-IN',
      'es-ES', 'fr-FR', 'de-DE',
      'it-IT', 'pt-BR', 'hi-IN',
      'ja-JP', 'zh-CN', 'ar-SA'
    ];
  }
}

// Export singleton instance
export const voiceSOSService = new VoiceSOSService();
export default voiceSOSService;
