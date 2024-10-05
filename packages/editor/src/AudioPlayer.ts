/* eslint-disable @typescript-eslint/no-unused-vars */
import { SongDataType, TrackDataType } from './types';
import $ from './utils/$';
import { bufferToBlob, encodeWAV, mergeAudioBuffers, writeString } from './utils/wav';

type Audio = {
  song: SongDataType;
  source: AudioBufferSourceNode;
  gain: GainNode;
};

class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private tracks: Map<string, { mute: boolean; songs: Map<string, Audio> }> = new Map();
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

  async prepareTrack(song: SongDataType, track: TrackDataType) {
    const buffer = await this.loadAudioBuffer(song.src);
    const context = this.createContext();
    const source = context.createBufferSource();
    source.buffer = buffer;

    const gainNode = context.createGain();
    gainNode.connect(context.destination);
    song.source = source;
    song.long = buffer.duration;
    this._duration = Math.max(this._duration, song.start + song.long);

    if (!this.tracks.has(track.id)) {
      this.tracks.set(track.id, { mute: false, songs: new Map() });
    }
    this.tracks.get(track.id)!.songs.set(song.id, { song, source, gain: gainNode });
  }

  play(startTime: number = 0): void {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    const currentTime = this.audioContext.currentTime;

    this.tracks.forEach((audioMap, trackId) => {
      audioMap.songs.forEach((track, audioId) => {
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

        audioMap.songs.set(audioId, { ...track, source: newSource });
      });
    });
  }

  pause(): void {
    this.tracks.forEach(audioMap => {
      audioMap.songs.forEach(track => {
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

  muteTrack(trackId: string, isMuted: boolean | undefined = undefined) {
    const track = this.tracks.get(trackId);
    if (track) {
      if (isMuted === undefined) {
        isMuted = !track.mute;
      }
      track.mute = isMuted;

      track.songs.forEach(audio => {
        audio.gain.gain.value = isMuted ? 0 : 1;
      });
    }
  }

  mute(trackId: string, isMuted: boolean | undefined = undefined) {
    const track = this.tracks.get(trackId);
    if (track) {
      track.songs.forEach(audio => {
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
    return Array.from(track.songs.values()).some(audio => audio.song.mute);
  }

  stop(): void {
    this.tracks.forEach(audioMap => {
      audioMap.songs.forEach(track => {
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
    return this.tracks.get(trackId)?.songs.values().next().value.source.buffer;
  }

  getDuration() {
    return this._duration;
  }

  async toBlob() {
    const audioBuffers: AudioBuffer[] = [];
    const startTimes: number[] = [];

    for (const audioMap of this.tracks.values()) {
      for (const track of audioMap.songs.values()) {
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
