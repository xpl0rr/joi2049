import { useRef, useCallback } from 'react';
import { View } from 'react-native';

interface DropZoneRef {
  element: View | null;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

interface DropResult {
  isOver: (position: { x: number; y: number }) => boolean;
  setRef: (ref: View | null) => void;
  dropZoneRef: DropZoneRef;
}

export const useDrop = (): DropResult => {
  const dropZoneRef = useRef<DropZoneRef>({
    element: null,
    bounds: null
  });

  const setRef = useCallback((ref: View | null) => {
    if (ref) {
      dropZoneRef.current.element = ref;
      
      // Measure the bounds of the dropzone
      ref.measure((x, y, width, height, pageX, pageY) => {
        dropZoneRef.current.bounds = {
          x: pageX,
          y: pageY,
          width,
          height
        };
      });
    } else {
      dropZoneRef.current.element = null;
      dropZoneRef.current.bounds = null;
    }
  }, []);

  const isOver = useCallback(
    (position: { x: number; y: number }): boolean => {
      const { bounds } = dropZoneRef.current;
      
      if (!bounds) return false;
      
      return (
        position.x >= bounds.x &&
        position.x <= bounds.x + bounds.width &&
        position.y >= bounds.y &&
        position.y <= bounds.y + bounds.height
      );
    },
    []
  );

  return {
    isOver,
    setRef,
    dropZoneRef: dropZoneRef.current
  };
}; 