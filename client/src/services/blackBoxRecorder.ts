// BlackBoxRecorder: maintains a rolling audio buffer and captures pre/post SOS evidence.
// Limitations: browser must stay active; background/locked screen capture may stop on mobile.

class BlackBoxRecorder {
  private stream: MediaStream | null = null;
  private bufferRecorder: MediaRecorder | null = null;
  private bufferChunks: Blob[] = [];
  private readonly bufferMs = 30000; // keep last 30s
  private bufferStartTime = Date.now();
  private mimeType = 'audio/webm';
  private isStarting = false;

  public async start(): Promise<void> {
    if (this.stream || this.isStarting) return;
    this.isStarting = true;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.startBufferRecorder();
    } catch (err) {
      console.error('BlackBoxRecorder: mic permission denied or unavailable', err);
    } finally {
      this.isStarting = false;
    }
  }

  public stop(): void {
    this.stopBufferRecorder();
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.bufferChunks = [];
  }

  private startBufferRecorder() {
    if (!this.stream) return;
    try {
      this.bufferRecorder = new MediaRecorder(this.stream, { mimeType: this.mimeType });
    } catch (err) {
      console.error('BlackBoxRecorder: failed to create MediaRecorder', err);
      return;
    }

    this.bufferRecorder.ondataavailable = (evt) => {
      if (evt.data && evt.data.size > 0) {
        this.bufferChunks.push(evt.data);
        this.trimBuffer();
      }
    };

    this.bufferStartTime = Date.now();
    this.bufferRecorder.start(1000); // push data every second
  }

  private stopBufferRecorder() {
    if (this.bufferRecorder && this.bufferRecorder.state !== 'inactive') {
      this.bufferRecorder.stop();
    }
    this.bufferRecorder = null;
  }

  private trimBuffer() {
    // Approximate trimming based on chunk count/time slice (1s)
    const maxChunks = Math.ceil(this.bufferMs / 1000);
    if (this.bufferChunks.length > maxChunks) {
      this.bufferChunks = this.bufferChunks.slice(this.bufferChunks.length - maxChunks);
    }
  }

  private async recordPostTrigger(durationMs: number): Promise<Blob | null> {
    if (!this.stream) return null;
    return new Promise((resolve) => {
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(this.stream!, { mimeType: this.mimeType });
      } catch (err) {
        console.error('BlackBoxRecorder: failed to start post recorder', err);
        resolve(null);
        return;
      }

      const chunks: Blob[] = [];
      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) chunks.push(evt.data);
      };
      recorder.onstop = () => {
        if (chunks.length === 0) return resolve(null);
        resolve(new Blob(chunks, { type: this.mimeType }));
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop();
      }, durationMs);
    });
  }

  public async captureClip(postDurationMs = 15000): Promise<Blob | null> {
    // ensure we are running
    if (!this.stream) {
      await this.start();
    }
    if (!this.stream) return null;

    // stop buffer, copy pre-chunks, record post, restart buffer
    this.stopBufferRecorder();
    const preChunks = [...this.bufferChunks];

    const postBlob = await this.recordPostTrigger(postDurationMs);

    // restart buffer recorder
    this.startBufferRecorder();

    const parts = preChunks.slice(-Math.ceil(this.bufferMs / 1000));
    if (postBlob) parts.push(postBlob);
    if (parts.length === 0) return null;
    return new Blob(parts, { type: this.mimeType });
  }
}

const blackBoxRecorder = new BlackBoxRecorder();
export default blackBoxRecorder;
