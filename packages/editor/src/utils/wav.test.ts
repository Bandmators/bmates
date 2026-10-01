import { beforeEach, describe, expect, it } from 'vitest';

import { encodeWAV, mergeAudioBuffers } from './wav';

class FakeAudioBuffer {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  readonly duration: number;
  private channels: Float32Array[];

  constructor(options: { length: number; numberOfChannels?: number; sampleRate: number }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels ?? 1;
    this.sampleRate = options.sampleRate;
    this.duration = this.length / this.sampleRate;
    this.channels = Array.from({ length: this.numberOfChannels }, () => new Float32Array(this.length));
  }

  getChannelData(channel: number) {
    return this.channels[channel];
  }
}

const createBuffer = (sampleRate: number, channels: number[][]) => {
  const buffer = new FakeAudioBuffer({
    length: channels[0].length,
    numberOfChannels: channels.length,
    sampleRate,
  });
  channels.forEach((samples, channel) => buffer.getChannelData(channel).set(samples));
  return buffer as unknown as AudioBuffer;
};

describe('WAV utilities', () => {
  beforeEach(() => {
    Object.assign(globalThis, { AudioBuffer: FakeAudioBuffer });
  });

  it('interleaves stereo PCM samples and clamps their range', () => {
    const buffer = createBuffer(4, [
      [1, -2],
      [0.5, -0.5],
    ]);
    const view = new DataView(encodeWAV(buffer));

    expect(view.getInt16(44, true)).toBe(32767);
    expect(view.getInt16(46, true)).toBe(16383);
    expect(view.getInt16(48, true)).toBe(-32768);
    expect(view.getInt16(50, true)).toBe(-16384);
  });

  it('preserves channels and resamples buffers onto a shared timeline', () => {
    const first = createBuffer(2, [[0.25, 0.25]]);
    const second = createBuffer(4, [
      [0.5, 0.5, 0.5, 0.5],
      [-0.5, -0.5, -0.5, -0.5],
    ]);

    const merged = mergeAudioBuffers([first, second], [0, 0.5]);

    expect(merged.sampleRate).toBe(4);
    expect(merged.numberOfChannels).toBe(2);
    expect(merged.length).toBe(6);
    expect(Array.from(merged.getChannelData(0))).toEqual([0.25, 0.25, 0.75, 0.75, 0.5, 0.5]);
    expect(Array.from(merged.getChannelData(1))).toEqual([0.25, 0.25, -0.25, -0.25, -0.5, -0.5]);
  });

  it('clips overlapping samples instead of wrapping PCM values', () => {
    const first = createBuffer(2, [[0.8, 0.8]]);
    const second = createBuffer(2, [[0.8, 0.8]]);

    const merged = mergeAudioBuffers([first, second], [0, 0]);

    expect(Array.from(merged.getChannelData(0))).toEqual([1, 1]);
  });

  it('rejects invalid empty mixes', () => {
    expect(() => mergeAudioBuffers([], [])).toThrow(/non-empty/);
  });
});
