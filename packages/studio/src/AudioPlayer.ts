import { SongDataType } from '@bmates/editor';

type Audio = {
  song: SongDataType;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
};

class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private tracks: Map<string, Audio> = new Map();
  private mutedTracks: Set<string> = new Set();

  initialize() {
    console.log('caall ');
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext.state;
  }

  async loadAudio(src: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }
    const proxyUrl = src.startsWith('http') ? `/audio${new URL(src).pathname}` : src;
    const response = await fetch(proxyUrl);
    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async prepareTrack(song: any, trackId: string): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }
    const buffer = await this.loadAudio(song.src);
    console.log(buffer);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    this.tracks.set(trackId, { song, source, gainNode });
  }

  play(): void {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }
    const startTime = this.audioContext.currentTime;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.tracks.forEach((track, _trackId) => {
      console.log(track);
      if (track.source) {
        track.source.start(startTime + track.song.start);
        if (track.source.buffer) {
          //   source.stop(startTime + song.start + song.long);
        }
      }

      console.log('yeah', track);
    });

    console.log(this.audioContext);
  }

  mute(trackId: string, isMuted: boolean): void {
    const { gainNode } = this.tracks.get(trackId);
    if (gainNode && this.audioContext) {
      gainNode.gain.setValueAtTime(isMuted ? 0 : 1, this.audioContext.currentTime);
      if (isMuted) {
        this.mutedTracks.add(trackId);
      } else {
        this.mutedTracks.delete(trackId);
      }
    }
  }

  isMuted(trackId: string): boolean {
    return this.mutedTracks.has(trackId);
  }

  stop(): void {
    this.tracks.forEach(track => {
      track.source.stop();
    });
  }
}

export default AudioPlayer;
