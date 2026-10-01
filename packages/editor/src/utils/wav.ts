export const writeString = (view: DataView, offset: number, str: string) => {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
};

export const encodeWAV = (ab: AudioBuffer) => {
  const numChannels = ab.numberOfChannels;
  const sampleRate = ab.sampleRate;
  const format = 1;
  const bitDepth = 16;

  const buffer = new ArrayBuffer(44 + ab.length * numChannels * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, buffer.byteLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, (sampleRate * numChannels * bitDepth) / 8, true);
  view.setUint16(32, (numChannels * bitDepth) / 8, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, ab.length * numChannels * 2, true);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = ab.getChannelData(channel);
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      const interleavedIndex = i * numChannels + channel;
      view.setInt16(44 + interleavedIndex * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }
  }

  return buffer;
};

export const mergeAudioBuffers = (buffers: AudioBuffer[], startTimes: number[]) => {
  if (buffers.length === 0 || buffers.length !== startTimes.length) {
    throw new Error('Audio buffers and start times must be non-empty and have matching lengths.');
  }

  const sampleRate = Math.max(...buffers.map(buffer => buffer.sampleRate));
  const numberOfChannels = Math.max(...buffers.map(buffer => buffer.numberOfChannels));
  const duration = Math.max(...buffers.map((buffer, index) => startTimes[index] + buffer.duration));
  const totalLength = Math.max(1, Math.ceil(duration * sampleRate));
  const mergedBuffer = new AudioBuffer({ length: totalLength, numberOfChannels, sampleRate });

  buffers.forEach((buffer, index) => {
    const startSample = Math.floor(startTimes[index] * sampleRate);
    const outputLength = Math.ceil(buffer.duration * sampleRate);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const source = buffer.getChannelData(Math.min(channel, buffer.numberOfChannels - 1));
      const output = mergedBuffer.getChannelData(channel);

      for (let i = 0; i < outputLength && startSample + i < output.length; i++) {
        const sourcePosition = (i * buffer.sampleRate) / sampleRate;
        const leftIndex = Math.floor(sourcePosition);
        const rightIndex = Math.min(leftIndex + 1, source.length - 1);
        const ratio = sourcePosition - leftIndex;
        const sample = source[leftIndex] * (1 - ratio) + source[rightIndex] * ratio;
        output[startSample + i] += sample;
      }
    }
  });

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const output = mergedBuffer.getChannelData(channel);
    for (let i = 0; i < output.length; i++) {
      output[i] = Math.max(-1, Math.min(1, output[i]));
    }
  }

  return mergedBuffer;
};

export const bufferToBlob = async (ab: AudioBuffer) => {
  const wavData = encodeWAV(ab);
  return new Blob([new Uint8Array(wavData)], { type: 'audio/wav' });
};
