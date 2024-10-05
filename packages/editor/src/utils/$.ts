const downloadObjectURL = (filename: string, obj: Blob | MediaSource) => {
  const url = URL.createObjectURL(obj);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const $ = {
  downloadObjectURL,
};
export default $;
