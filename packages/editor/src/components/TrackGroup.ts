import { Container } from '@bmates/renderer';

import { Memento } from '../HistoryManager';
import { EditorStyleType, TrackDataType } from '../types';
import { Editor } from './Editor';
import { Track } from './Track';
import { Wave } from './Wave';

export class TrackGroup extends Container<Track> {
  override name = 'TrackGroup';

  constructor(private style: EditorStyleType) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override update(_dT: number) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override draw(_ctx: CanvasRenderingContext2D) {}

  getTracks() {
    this.children.sort((a, b) => a.data.group - b.data.group);
    return this.children;
  }

  getWaves() {
    return this.getTracks().flatMap(track => track.children);
  }

  createMemento() {
    return new Memento(this.children.map(child => child.toObject()));
  }

  async reconcile(data: TrackDataType[]) {
    const editor = this.parent?.parent;
    if (!(editor instanceof Editor)) throw new Error('TrackGroup must be attached to an Editor before reconciliation.');

    const existingTracks = [...this.getTracks()];

    for (const trackData of data) {
      let track = existingTracks.find(candidate => candidate.data.id === trackData.id);
      if (!track) {
        track = new Track({ ...trackData, songs: [] });
        this.add(track);
      } else {
        track.data = { ...trackData, songs: track.children.map(wave => wave.data) };
      }

      const existingWaves = [...track.children];
      for (const songData of trackData.songs) {
        const wave = existingWaves.find(candidate => candidate.data.id === songData.id);
        if (!wave) {
          const nextWave = new Wave(songData, this.style);
          track.add(nextWave);
          await editor._audioPlayer.prepareWave(nextWave);
          continue;
        }

        const sourceChanged = wave.data.src !== songData.src;
        if (sourceChanged) editor._audioPlayer.releaseWave(wave);
        wave.applyData(songData);
        if (sourceChanged) await editor._audioPlayer.prepareWave(wave);
      }

      existingWaves.forEach(wave => {
        if (!trackData.songs.some(song => song.id === wave.data.id)) {
          editor._audioPlayer.releaseWave(wave);
          track.remove(wave);
        }
      });
      track.data.songs = track.children.map(wave => wave.data);
    }

    existingTracks.forEach(track => {
      if (!data.some(candidate => candidate.id === track.data.id)) {
        track.children.forEach(wave => editor._audioPlayer.releaseWave(wave));
        this.remove(track);
      }
    });

    this.children.sort((a, b) => a.data.group - b.data.group);
    this.children.forEach(track => editor._audioPlayer.muteTrack(track.data.id, Boolean(track.data.mute)));
  }

  async restore(trackgroup: Memento) {
    const restoredData = trackgroup.restore();
    const existingTracks = this.getTracks();

    for (const state of restoredData) {
      const existingTrack = existingTracks.find(track => track.data.id === state.data.id);

      if (existingTrack) {
        existingTrack.setAttrs(state);
        await this.updateWaves(existingTrack, state.children);
      } else {
        const newTrack = new Track(state.data);
        this.add(newTrack);
        await this.updateWaves(newTrack, state.children);
      }
    }

    [...existingTracks].forEach(existingTrack => {
      if (!restoredData.find(track => track.data.id === existingTrack.data.id)) {
        const editor = this.parent.parent;
        if (editor instanceof Editor) {
          existingTrack.children.forEach(wave => editor._audioPlayer.releaseWave(wave));
        }
        this.remove(existingTrack);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async updateWaves(track: Track, waveData: any[]) {
    const existingWaves = track.children;

    for (const state of waveData) {
      const existingWave = existingWaves.find(wave => wave.data.id === state.data.id);
      if (existingWave) {
        existingWave.setAttrs(state);
      } else {
        const newWave = new Wave(state.data, this.style);
        track.add(newWave);

        if (this.parent.parent instanceof Editor) {
          await this.parent.parent._audioPlayer.prepareWave(newWave);
        }
      }
    }

    [...existingWaves].forEach(existingWave => {
      if (!waveData.find(wave => wave.data.id === existingWave.data.id)) {
        if (this.parent.parent instanceof Editor) {
          this.parent.parent._audioPlayer.releaseWave(existingWave);
        }
        track.remove(existingWave);
      }
    });
  }

  snapshot() {
    const ws = this.parent;
    const edi = ws.parent as Editor;
    edi.saveState();
  }
}
