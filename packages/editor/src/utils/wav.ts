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
      view.setInt16(44 + (channel * ab.length + i) * 2, channelData[i] * 0x7fff, true);
    }
  }

  return buffer;
};

export const mergeAudioBuffers = (buffers: AudioBuffer[], startTimes: number[]) => {
  const sampleRate = buffers[0].sampleRate;
  const totalLength = Math.ceil(Math.max(...startTimes) * sampleRate) + Math.max(...buffers.map(b => b.length));
  const mergedBuffer = new AudioBuffer({ length: totalLength, sampleRate });

  buffers.forEach((buffer, index) => {
    const startTime = startTimes[index];
    const startSample = Math.floor(startTime * sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const sampleIndex = startSample + i;
      if (sampleIndex < mergedBuffer.length) {
        mergedBuffer.getChannelData(0)[sampleIndex] += channelData[i];
      }
    }
  });

  return mergedBuffer;
};

export const bufferToBlob = async (ab: AudioBuffer) => {
  const wavData = encodeWAV(ab);
  return new Blob([new Uint8Array(wavData)], { type: 'audio/wav' });
};
