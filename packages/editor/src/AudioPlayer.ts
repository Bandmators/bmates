/* eslint-disable @typescript-eslint/no-unused-vars */
import { Track, TrackGroup, Wave } from './components';
import { TrackDataType } from './types';
import $ from './utils/$';
import { bufferToBlob, mergeAudioBuffers, writeString } from './utils/wav';

interface Cache {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private _duration: number = 0;
  private trackGroup: TrackGroup;
  private _cache = new Map<string, Cache>();

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

  moveAudioTrack(audioId: string, newTrack: TrackDataType) {
    const tracks = this.getTracks();
    tracks.forEach(track => {
      const audio = track.children.find(child => child.data.id === audioId);
      if (audio) {
        track.remove(audio);
        const newTrackInstance = tracks.find(t => t.data.id === newTrack.id);
        newTrackInstance?.add(audio);
      }
    });
  }

  async prepareTrackAll(waves: Wave[]) {
    const loadPromises = waves.map(song => this.prepareWave(song));
    await Promise.all(loadPromises);
  }

  async prepareWave(wave: Wave) {
    const cache = this._cache.get(wave.data.id);

    if (cache) {
      wave.gain = cache.gain;
      wave.data.long = cache.source.buffer.duration;
      wave.source = cache.source;
    } else {
      const buffer = await this.loadAudioBuffer(wave.data.src);
      const context = this.createContext();
      const source = context.createBufferSource();
      source.buffer = buffer;
      const gainNode = context.createGain();
      gainNode.connect(context.destination);

      wave.gain = gainNode;
      wave.data.long = buffer.duration;
      wave.source = source;
    }
    this._duration = Math.max(this._duration, wave.data.start + wave.data.long);
  }

  play(startTime: number = 0) {
    const tracks = this.getTracks();
    const currentTime = this.audioContext!.currentTime;

    tracks.forEach(track => {
      track.children.forEach((wave: Wave) => {
        if (wave.source) {
          try {
            wave.source.stop();
          } catch (err) {
            /* */
          }
        }
        const newSource = this.audioContext!.createBufferSource();
        newSource.buffer = wave.source.buffer;
        newSource.connect(wave.gain);

        const trackStartTime = Math.max(0, wave.data.start - startTime);
        const sourceStartTime = Math.max(0, startTime - wave.data.start);

        newSource.start(currentTime + trackStartTime, sourceStartTime);
        wave.source = newSource;
      });
    });
  }

  pause(): void {
    const tracks = this.getTracks();
    tracks.forEach(track => {
      track.children.forEach((wave: Wave) => {
        if (wave.source) {
          try {
            wave.source.stop();
          } catch (err) {
            /* */
          }
        }
      });
    });
  }

  muteTrack(trackId: string, isMuted: boolean | undefined = undefined) {
    const track = this.getTracks().find(t => t.data.id === trackId);
    if (track) {
      if (isMuted === undefined) {
        isMuted = !track.data.mute;
      }
      track.data.mute = isMuted;

      track.children.forEach((wave: Wave) => {
        wave.gain.gain.value = isMuted || wave.data.mute ? 0 : 1;
      });
    }
  }

  removeTrack(trackId: string) {
    const trackIndex = this.getTracks().findIndex(t => t.data.id === trackId);
    if (trackIndex !== -1) {
      this.getTracks()
        .filter(t => t.data.group > this.getTracks()[trackIndex].data.group)
        .forEach(track => {
          track.data.group--;
          track.children.forEach(wave => {
            wave.data.group--;
            wave.repositioning();
          });
        });
      this.getTracks()[trackIndex].destroy();
    }
  }

  mute(songId: string, isMuted: boolean | undefined = undefined) {
    const wave = this.getWaves().find(child => child.data.id === songId);
    if (wave) {
      if (isMuted === undefined) {
        isMuted = !wave.data.mute;
      }
      wave.data.mute = isMuted;
      wave.gain.gain.value = isMuted || (wave.parent as Track).data.mute ? 0 : 1;
    }
  }

  isMuted(trackId: string) {
    const track = this.getTracks().find(t => t.data.id === trackId);
    if (!track) return false;
    return track.children.some((wave: Wave) => wave.data.mute);
  }

  stop() {
    const tracks = this.getTracks();
    tracks?.forEach(track => {
      track.children.forEach((wave: Wave) => {
        if (wave.source) {
          try {
            wave.source.stop();
          } catch (error) {
            /* */
          }
          wave.source.disconnect();
        }
      });
    });
  }

  getAudioBuffer(trackId: string): AudioBuffer | undefined {
    const track = this.getTracks().find(t => t.data.id === trackId);
    return track?.children[0]?.source.buffer;
  }

  refreshDuration() {
    const tracks = this.getTracks();
    let maxEndTime = 0;

    tracks.forEach(track => {
      track.children.forEach((wave: Wave) => {
        const endTime = wave.data.start + wave.data.long;
        maxEndTime = Math.max(maxEndTime, endTime);
      });
    });

    this._duration = maxEndTime;
  }

  getDuration() {
    return this._duration;
  }

  async toBlob() {
    const audioBuffers: AudioBuffer[] = [];
    const startTimes: number[] = [];

    this.getTracks()
      .filter(track => !track.data.mute)
      .flatMap(track => track.children)
      .filter(wave => !wave.data.mute)
      .forEach(wave => {
        audioBuffers.push(wave.source.buffer);
        startTimes.push(wave.data.start);
      });

    const mergedBuffer = mergeAudioBuffers(audioBuffers, startTimes);
    const audioBlob = await bufferToBlob(mergedBuffer);
    return audioBlob;
  }

  async downloadBlob(filename: string) {
    const blob = await this.toBlob();
    $.downloadObjectURL(filename, blob);
  }

  setTrackGroup(tg: TrackGroup) {
    this.trackGroup = tg;
  }

  getTracks() {
    return this.trackGroup?.getTracks() || [];
  }

  getWaves() {
    return this.trackGroup.getWaves() || [];
  }
}

export default AudioPlayer;
