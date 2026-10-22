import { useEffect, useRef, useState } from 'react';

export default function useImageReader(onLoad, onError) {
  const readerRef = useRef(null);
  const [progress, setProgress] = useState(null);
  useEffect(() => () => {
    if (readerRef.current?.readyState === FileReader.LOADING) readerRef.current.abort();
  }, []);

  const readImage = (file) => {
    if (readerRef.current?.readyState === FileReader.LOADING) readerRef.current.abort();
    const reader = new FileReader();
    readerRef.current = reader;
    setProgress(0);
    reader.onprogress = (event) => {
      if (event.lengthComputable) setProgress(Math.round(event.loaded / event.total * 100));
    };
    reader.onload = () => onLoad(reader.result);
    reader.onerror = () => onError('Could not read image. Please try again.');
    reader.onloadend = () => setProgress(null);
    reader.readAsDataURL(file);
  };
  return { readImage, progress };
}
