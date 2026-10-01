/* eslint-disable @typescript-eslint/no-unused-vars */
import { Track, TrackGroup, Wave } from './components';
import $ from './utils/$';
import { bufferToBlob, mergeAudioBuffers } from './utils/wav';

interface Cache {
  buffer: AudioBuffer;
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
    if (!response.ok) {
      throw new Error(`Failed to load audio: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return await context.decodeAudioData(arrayBuffer);
  }

  async prepareTrackAll(waves: Wave[]) {
    const loadPromises = waves.map(song => this.prepareWave(song));
    await Promise.all(loadPromises);
  }

  async prepareWave(wave: Wave, providedBuffer?: AudioBuffer) {
    const cache = this._cache.get(wave.data.src);
    const context = this.createContext();

    const buffer = providedBuffer ?? cache?.buffer ?? (await this.loadAudioBuffer(wave.data.src));
    if (providedBuffer || !cache) {
      this._cache.set(wave.data.src, { buffer });
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    const gainNode = context.createGain();
    gainNode.connect(context.destination);

    wave.gain = gainNode;
    gainNode.gain.value = wave.data.mute || (wave.parent as Track).data.mute ? 0 : 1;
    wave.data.long = buffer.duration;
    wave.source = source;

    this._duration = Math.max(this._duration, wave.data.start + wave.data.long);
  }

  async play(startTime: number = 0) {
    if (this.getWaves().length === 0) return;
    const context = this.createContext();
    if (context.state === 'suspended') await context.resume();
    const tracks = this.getTracks();
    const currentTime = context.currentTime;

    tracks.forEach(track => {
      track.children.forEach((wave: Wave) => {
        if (wave.source) {
          try {
            wave.source.stop();
          } catch (err) {
            /* */
          }
          wave.source.disconnect();
        }
        const buffer = wave.source?.buffer;
        if (!buffer || startTime >= wave.data.start + buffer.duration) return;
        const newSource = context.createBufferSource();
        newSource.buffer = buffer;
        newSource.connect(wave.gain);

        const trackStartTime = Math.max(0, wave.data.start - startTime);
        const sourceStartTime = Math.max(0, startTime - wave.data.start);

        newSource.start(currentTime + trackStartTime, sourceStartTime);
        wave.source = newSource;
      });
    });
  }

  pause() {
    const tracks = this.getTracks();
    tracks.forEach(track => {
      track.children.forEach((wave: Wave) => {
        if (wave.source) {
          try {
            wave.source.stop();
          } catch (err) {
            /* */
          }
          wave.source.disconnect();
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
        if (wave.gain) wave.gain.gain.value = isMuted || wave.data.mute ? 0 : 1;
      });
    }
  }

  removeTrack(trackId: string) {
    const trackIndex = this.getTracks().findIndex(t => t.data.id === trackId);
    if (trackIndex !== -1) {
      this.getTracks()[trackIndex].children.forEach(wave => this.releaseWave(wave));
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
      if (wave.gain) wave.gain.gain.value = isMuted || (wave.parent as Track).data.mute ? 0 : 1;
    }
  }

  isMuted(trackId: string) {
    const track = this.getTracks().find(t => t.data.id === trackId);
    if (!track) return false;
    return Boolean(track.data.mute);
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
        const endTime = wave.data.start + (wave.data.long ?? wave.source?.buffer?.duration ?? 0);
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
        if (wave.source?.buffer) {
          audioBuffers.push(wave.source.buffer);
          startTimes.push(wave.data.start);
        }
      });

    const context = this.createContext();
    const mergedBuffer =
      audioBuffers.length > 0
        ? mergeAudioBuffers(audioBuffers, startTimes)
        : context.createBuffer(1, 1, context.sampleRate);
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
    return this.trackGroup?.getWaves() || [];
  }

  releaseWave(wave: Wave) {
    if (wave.source) {
      try {
        wave.source.stop();
      } catch (error) {
        /* source may not have been started */
      }
      wave.source.disconnect();
    }
    wave.gain?.disconnect();
  }

  async destroy() {
    this.stop();
    this.getWaves().forEach(wave => wave.gain?.disconnect());
    this._cache.clear();
    const context = this.audioContext;
    this.audioContext = null;
    if (context && context.state !== 'closed') await context.close();
  }
}

export default AudioPlayer;
