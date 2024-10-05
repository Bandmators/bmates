/* eslint-disable @typescript-eslint/no-unused-vars */
import { SongDataType } from './types';
import $ from './utils/$';
import { bufferToBlob, encodeWAV, mergeAudioBuffers, writeString } from './utils/wav';

type Audio = {
  song: SongDataType;
  source: AudioBufferSourceNode;
  gain: GainNode;
};

class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private tracks: Map<string, Map<string, Audio>> = new Map();
  private _duration: number = 0;

  createContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  async loadAudioBuffer(src: string) {
    const context = this.createContext();
    const proxyUrl = src;
    const response = await fetch(proxyUrl);
    const arrayBuffer = await response.arrayBuffer();
    return await context.decodeAudioData(arrayBuffer);
  }

  async prepareTrack(song: SongDataType, trackId: string) {
    const buffer = await this.loadAudioBuffer(song.src);
    const context = this.createContext();
    const source = context.createBufferSource();
    source.buffer = buffer;

    const gainNode = context.createGain();
    gainNode.connect(context.destination);
    song.source = source;
    song.long = buffer.duration;
    this._duration = Math.max(this._duration, song.start + song.long);

    if (!this.tracks.has(trackId)) {
      this.tracks.set(trackId, new Map());
    }
    this.tracks.get(trackId)!.set(song.id, { song, source, gain: gainNode });
  }

  play(startTime: number = 0): void {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    const currentTime = this.audioContext.currentTime;

    this.tracks.forEach((audioMap, trackId) => {
      audioMap.forEach((track, audioId) => {
        if (track.source) {
          try {
            track.source.stop();
          } catch (err) {
            /* */
          }
        }
        const newSource = this.audioContext!.createBufferSource();
        newSource.buffer = track.source.buffer;
        newSource.connect(track.gain);

        const trackStartTime = Math.max(0, track.song.start - startTime);
        const sourceStartTime = Math.max(0, startTime - track.song.start);

        newSource.start(currentTime + trackStartTime, sourceStartTime);

        audioMap.set(audioId, { ...track, source: newSource });
      });
    });
  }

  pause(): void {
    this.tracks.forEach(audioMap => {
      audioMap.forEach(track => {
        if (track.source) {
          try {
            track.source.stop();
          } catch (err) {
            /* */
          }
        }
      });
    });
  }

  mute(trackId: string, isMuted: boolean | undefined = undefined) {
    const track = this.tracks.get(trackId);
    if (track) {
      track.forEach(audio => {
        if (isMuted === undefined) {
          isMuted = !audio.song.mute;
        }
        audio.song.mute = isMuted;
        audio.gain.gain.value = isMuted ? 0 : 1;
      });
    }
  }

  isMuted(trackId: string) {
    const track = this.tracks.get(trackId);
    if (!track) return false;
    return Array.from(track.values()).some(audio => audio.song.mute);
  }

  stop(): void {
    this.tracks.forEach(audioMap => {
      audioMap.forEach(track => {
        if (track.source) {
          try {
            track.source.stop();
          } catch (error) {
            /* */
          }
          track.source.disconnect();
        }
      });
    });
  }

  getAudioBuffer(trackId: string): AudioBuffer | undefined {
    return this.tracks.get(trackId)?.values().next().value.source.buffer;
  }

  getDuration() {
    return this._duration;
  }

  async toBlob() {
    const audioBuffers: AudioBuffer[] = [];
    const startTimes: number[] = [];

    for (const audioMap of this.tracks.values()) {
      for (const track of audioMap.values()) {
        if (!track.song.mute) {
          audioBuffers.push(track.source.buffer);
          startTimes.push(track.song.start);
        }
      }
    }

    const mergedBuffer = mergeAudioBuffers(audioBuffers, startTimes);
    const audioBlob = await bufferToBlob(mergedBuffer);
    return audioBlob;
  }

  async downloadBlob(filename: string) {
    const blob = await this.toBlob();
    $.downloadObjectURL(filename, blob);
  }
}

export default AudioPlayer;
