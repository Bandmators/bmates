import { Container } from '@bmates/renderer';

import { Memento } from 'src/HistoryManager';
import { EditorStyleType } from 'src/types';

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

  restore(trackgroup: Memento) {
    console.log('res ');
    const restoredData = trackgroup.restore();
    const existingTracks = this.getTracks();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    restoredData.forEach((state: any) => {
      const existingTrack = existingTracks.find(track => track.data.id === state.data.id);

      if (existingTrack) {
        existingTrack.setAttrs(state);
        this.updateWaves(existingTrack, state.children);
      } else {
        const newTrack = new Track(state.data);
        this.add(newTrack);
        this.updateWaves(newTrack, state.children);
      }
    });

    existingTracks.forEach(existingTrack => {
      if (!restoredData.find(track => track.data.id === existingTrack.data.id)) {
        this.remove(existingTrack);
      }
    });

    this.call('data-change', { data: restoredData, target: this });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private updateWaves(track: Track, waveData: any[]) {
    const existingWaves = track.children;

    waveData.forEach(state => {
      const existingWave = existingWaves.find(wave => wave.data.id === state.data.id);
      if (existingWave) {
        existingWave.setAttrs(state);
      } else {
        const newWave = new Wave(state.data, this.style);
        track.add(newWave);

        if (this.parent.parent instanceof Editor) {
          this.parent.parent._audioPlayer.prepareWave(newWave);
        }
      }
    });

    existingWaves.forEach(existingWave => {
      if (!waveData.find(wave => wave.data.id === existingWave.data.id)) {
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
