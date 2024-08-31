import { SongDataType } from './types';

type Audio = {
  song: SongDataType;
  source: AudioBufferSourceNode;
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

  async loadAudioBuffer(src: string) {
    const context = this.createContext();
    const proxyUrl = src.startsWith('http') ? `/audio${new URL(src).pathname}` : src;
    const response = await fetch(proxyUrl);
    const arrayBuffer = await response.arrayBuffer();
    return await context.decodeAudioData(arrayBuffer);
  }

  async prepareTrack(song: SongDataType, trackId: string) {
    const buffer = await this.loadAudioBuffer(song.src);
    const context = this.createContext();

    const source = context.createBufferSource();

    // const gainNode = context.createGain();
    // const analyserNode = context.createAnalyser();
    // analyserNode.fftSize = 2048;

    source.connect(context.destination);
    // source.connect(gainNode);
    // gainNode.connect(analyserNode);
    // analyserNode.connect(context.destination);

    source.buffer = buffer;
    song.source = source;

    this.tracks.set(trackId, { song, source, muted: false });
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
    track.muted = isMuted;
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
    return this.tracks.get(trackId)?.source.buffer;
  }
}

export default AudioPlayer;
