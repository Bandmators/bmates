import { SongDataType } from './types';

type Audio = {
  song: SongDataType;
  buffer: AudioBuffer;
  source?: AudioBufferSourceNode;
  gainNode?: GainNode;
  muted: boolean;
};

class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private tracks: Map<string, Audio> = new Map();

  createContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  async loadAudio(src: string): Promise<AudioBuffer> {
    const context = this.createContext();
    const proxyUrl = src.startsWith('http') ? `/audio${new URL(src).pathname}` : src;
    const response = await fetch(proxyUrl);
    const arrayBuffer = await response.arrayBuffer();
    return await context.decodeAudioData(arrayBuffer);
  }

  async prepareTrack(song: SongDataType, trackId: string): Promise<void> {
    const buffer = await this.loadAudio(song.src);
    this.tracks.set(trackId, { song, buffer, muted: false });
    song.buffer = buffer;
  }

  setupTrack(trackId: string) {
    const context = this.createContext();
    const track = this.tracks.get(trackId);
    if (!track) return;

    const source = context.createBufferSource();
    source.buffer = track.buffer;

    const gainNode = context.createGain();
    const analyserNode = context.createAnalyser();
    analyserNode.fftSize = 2048;

    source.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(context.destination);

    track.source = source;
    track.gainNode = gainNode;

    console.log('setup', track);
  }

  async start() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    this.tracks.forEach((_, trackId) => this.setupTrack(trackId));
  }

  play(): void {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    const startTime = this.audioContext.currentTime;

    this.tracks.forEach(track => {
      if (track.source) {
        track.source.start(startTime + track.song.start);
      }
    });
  }

  mute(trackId: string, isMuted: boolean): void {
    const track = this.tracks.get(trackId);
    if (track?.gainNode && this.audioContext) {
      track.gainNode.gain.setValueAtTime(isMuted ? 0 : 1, this.audioContext.currentTime);
      if (isMuted) {
        track.muted = true;
      } else {
        track.muted = false;
      }
    }
  }

  isMuted(trackId: string): boolean {
    const track = this.tracks.get(trackId);
    if (!track) return false;
    return track.muted;
  }

  stop(): void {
    this.tracks.forEach(track => {
      if (track.source) track.source.stop();
    });
  }

  getAudioBuffer(trackId: string): AudioBuffer | undefined {
    return this.tracks.get(trackId)?.buffer;
  }
}

export default AudioPlayer;
