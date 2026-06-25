import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Canvas, FabricImage, filters, setFilterBackend, Canvas2dFilterBackend } from 'fabric';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import styles from './CanvasEditor.module.css';

setFilterBackend(new Canvas2dFilterBackend());

export interface ImageState {
  cropX: number;
  cropY: number;
  width: number;
  height: number;
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  filters: {
    brightness: number;
    definition: number;
    blur: number;
  };
  zoom: number;
}

export interface CanvasEditorHandle {
  applyFilter: (type: string, value: number) => void;
  loadState: (state: ImageState) => Promise<any>;
  getCurrentState: () => ImageState | null;
  setZoom: (value: number) => void;
  setToolMode: (tool: string) => void;
  confirmCrop: () => void;
  exportImage: () => string | null;
  setCropAspectRatio: (ratio: number | null) => void;
}

interface CanvasEditorProps { 
  imageUrl: string; 
  onImageLoaded?: (state: ImageState) => void;
}

export const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(({ imageUrl, onImageLoaded }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<Canvas | null>(null);
  const imageObject = useRef<FabricImage | null>(null);
  const currentToolMode = useRef<string>('none');

  const originalWidth = useRef<number>(0);
  const originalHeight = useRef<number>(0);

  const activeFilters = useRef<{ [key: string]: number }>({
    brightness: 0,
    definition: 0,
    blur: 0,
  });

  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  const [isCropping, setIsCropping] = useState(false);
  const cropperRef = useRef<Cropper | null>(null);
  const cropperImgRef = useRef<HTMLImageElement | null>(null);
  const [cssFilters, setCssFilters] = useState<string>('none');

  const updateFilterStyle = () => {
    const brightnessVal = activeFilters.current.brightness !== 0 ? `brightness(${1 + activeFilters.current.brightness / 100})` : '';
    const contrastVal = activeFilters.current.definition !== 0 ? `contrast(${1 + activeFilters.current.definition / 100})` : '';
    const blurVal = activeFilters.current.blur !== 0 ? `blur(${activeFilters.current.blur / 5}px)` : '';
    
    const filterString = [brightnessVal, contrastVal, blurVal].filter(Boolean).join(' ');
    setCssFilters(filterString || 'none');
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 550;

    const canvas = new Canvas(canvasRef.current, { 
      width, 
      height,
      backgroundColor: '#3C3C32', 
    });
    fabricCanvas.current = canvas;
    canvas.setCursor('grab');

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: w, height: h } = entries[0].contentRect;
      canvas.setDimensions({ width: w, height: h });
      canvas.requestRenderAll();
    });
    resizeObserver.observe(containerRef.current);

    FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' })
      .then((img) => {
        imageObject.current = img;
        originalWidth.current = img.width;
        originalHeight.current = img.height;

        const scaleX = (canvas.getWidth() * 0.75) / img.width;
        const scaleY = (canvas.getHeight() * 0.75) / img.height;
        const scale = Math.min(scaleX, scaleY);
        
        img.set({
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
          lockSkewingX: true,
          lockSkewingY: true,
        });

        canvas.add(img);
        canvas.centerObject(img);
        img.setCoords();
        canvas.requestRenderAll();

        if (onImageLoaded) {
          onImageLoaded({
            cropX: 0,
            cropY: 0,
            width: img.width,
            height: img.height,
            left: img.left,
            top: img.top,
            scaleX: scale,
            scaleY: scale,
            filters: { brightness: 0, definition: 0, blur: 0 },
            zoom: 50
          });
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки изображения:", err);
      });

    canvas.on('mouse:down', (opt) => {
      const point = opt.viewportPoint || (opt.e ? { x: (opt.e as any).clientX, y: (opt.e as any).clientY } : null);
      if (!point) return;

      if (currentToolMode.current === 'none' || currentToolMode.current === '') {
        isDragging.current = true;
        canvas.selection = false;
        lastX.current = point.x;
        lastY.current = point.y;
        canvas.setCursor('grabbing');
      }
    });

    canvas.on('mouse:move', (opt) => {
      const point = opt.viewportPoint || (opt.e ? { x: (opt.e as any).clientX, y: (opt.e as any).clientY } : null);
      if (!point) return;

      if (isDragging.current) {
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += point.x - lastX.current;
          vpt[5] += point.y - lastY.current;
          canvas.requestRenderAll();
        }
        lastX.current = point.x;
        lastY.current = point.y;
      }
    });

    canvas.on('mouse:up', () => {
      isDragging.current = false;
      if (currentToolMode.current === 'none' || currentToolMode.current === '') {
        canvas.setCursor('grab');
      }
    });

    return () => {
      resizeObserver.disconnect();
      canvas.dispose();
    };
  }, [imageUrl]);

  useEffect(() => {
    if (isCropping && cropperImgRef.current) {
      const img = imageObject.current;
      
      let cropper: Cropper | null = null;
      cropper = new Cropper(cropperImgRef.current, {
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
        restore: false,
        modal: true,
        guides: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        ready() {
          if (img && cropper) {
            cropper.setData({
              x: img.cropX || 0,
              y: img.cropY || 0,
              width: img.width || originalWidth.current,
              height: img.height || originalHeight.current,
            });
          }
        }
      });

      cropperRef.current = cropper;

      return () => {
        if (cropper) {
          cropper.destroy();
        }
        cropperRef.current = null;
      };
    }
  }, [isCropping]);

  useImperativeHandle(ref, () => ({
    applyFilter: (type, value) => {
      const canvas = fabricCanvas.current;
      const img = imageObject.current;
      if (!img || !canvas) return;

      activeFilters.current[type] = value;
      updateFilterStyle();

      const newFilters: any[] = [];

      if (activeFilters.current.brightness !== 0) {
        newFilters.push(new filters.Brightness({ brightness: activeFilters.current.brightness / 100 }));
      }
      if (activeFilters.current.definition !== 0) {
        newFilters.push(new filters.Contrast({ contrast: activeFilters.current.definition / 100 }));
      }
      if (activeFilters.current.blur !== 0) {
        newFilters.push(new filters.Blur({ blur: activeFilters.current.blur / 100 }));
      }

      img.filters = newFilters;
      img.dirty = true;
      img.applyFilters();
      canvas.requestRenderAll();
    },

    loadState: async (state: ImageState) => {
      const canvas = fabricCanvas.current;
      const img = imageObject.current;
      if (!canvas || !img || !state) return { brightness: 0, definition: 0, blur: 0, zoom: 50 };

      activeFilters.current = { ...state.filters };
      updateFilterStyle();

      const newFilters: any[] = [];
      if (activeFilters.current.brightness !== 0) {
        newFilters.push(new filters.Brightness({ brightness: activeFilters.current.brightness / 100 }));
      }
      if (activeFilters.current.definition !== 0) {
        newFilters.push(new filters.Contrast({ contrast: activeFilters.current.definition / 100 }));
      }
      if (activeFilters.current.blur !== 0) {
        newFilters.push(new filters.Blur({ blur: activeFilters.current.blur / 100 }));
      }
      img.filters = newFilters;
      img.dirty = true;
      img.applyFilters();

      img.set({
        cropX: state.cropX,
        cropY: state.cropY,
        width: state.width,
        height: state.height,
        left: state.left,
        top: state.top,
        scaleX: state.scaleX,
        scaleY: state.scaleY,
      });

      img.setCoords();

      const zoomFactor = state.zoom <= 50 
        ? 0.2 + (0.8 * (state.zoom / 50)) 
        : 1.0 + (2.0 * ((state.zoom - 50) / 50));
      const center = canvas.getCenterPoint();
      canvas.zoomToPoint(center, zoomFactor);

      canvas.requestRenderAll();
      return { ...state.filters, zoom: state.zoom };
    },

    getCurrentState: () => {
      const img = imageObject.current;
      const canvas = fabricCanvas.current;
      if (!img || !canvas) return null;

      return {
        cropX: img.cropX || 0,
        cropY: img.cropY || 0,
        width: img.width,
        height: img.height,
        left: img.left,
        top: img.top,
        scaleX: img.scaleX,
        scaleY: img.scaleY,
        filters: {
          brightness: activeFilters.current.brightness || 0,
          definition: activeFilters.current.definition || 0,
          blur: activeFilters.current.blur || 0,
        },
        zoom: Math.round(canvas.getZoom() * 50)
      };
    },

    setZoom: (value) => {
      const canvas = fabricCanvas.current;
      if (!canvas) return;

      const zoomFactor = value <= 50 
        ? 0.2 + (0.8 * (value / 50)) 
        : 1.0 + (2.0 * ((value - 50) / 50));

      const center = canvas.getCenterPoint();
      canvas.zoomToPoint(center, zoomFactor);
      canvas.requestRenderAll();
    },

    setToolMode: (tool) => {
      currentToolMode.current = tool;
      const canvas = fabricCanvas.current;
      if (!canvas) return;

      if (tool === 'crop') {
        setIsCropping(true);
        canvas.setCursor('default');
      } else {
        setIsCropping(false);
        canvas.setCursor('grab');
        canvas.discardActiveObject();
      }
      canvas.requestRenderAll();
    },

    confirmCrop: () => {
      const canvas = fabricCanvas.current;
      const img = imageObject.current;
      const cropper = cropperRef.current;
      if (!canvas || !img || !cropper) return;

      const data = cropper.getData(true);

      const currentCropX = img.cropX || 0;
      const currentCropY = img.cropY || 0;
      const currentScaleX = img.scaleX || 1;
      const currentScaleY = img.scaleY || 1;

      const uncroppedLeft = img.left - (currentCropX * currentScaleX);
      const uncroppedTop = img.top - (currentCropY * currentScaleY);

      const newCropX = Math.max(0, data.x);
      const newCropY = Math.max(0, data.y);
      const newWidth = Math.min(originalWidth.current || img.width, data.width);
      const newHeight = Math.min(originalHeight.current || img.height, data.height);

      const newLeft = uncroppedLeft + (newCropX * currentScaleX);
      const newTop = uncroppedTop + (newCropY * currentScaleY);

      img.set({
        cropX: newCropX,
        cropY: newCropY,
        width: newWidth,
        height: newHeight,
        left: newLeft,
        top: newTop,
        dirty: true,
      });

      setIsCropping(false);
      currentToolMode.current = 'none';
      img.setCoords();
      canvas.requestRenderAll();
    },

    exportImage: () => {
      const img = imageObject.current;
      if (!img) return null;
      return img.toDataURL();
    },

    setCropAspectRatio: (ratio) => {
      const cropper = cropperRef.current;
      if (cropper) {
        cropper.setAspectRatio(ratio !== null ? ratio : NaN);
      }
    }
  }));

  return (
    <div 
      className={styles.container} 
      ref={containerRef}
      style={{ '--cropper-filter': cssFilters } as React.CSSProperties}
    >
      <canvas ref={canvasRef} />
      
      {isCropping && (
        <div className={styles.cropperWrapper}>
          <img 
            ref={cropperImgRef} 
            src={imageUrl} 
            alt="To Crop" 
            className={styles.cropperImg} 
            crossOrigin="anonymous"
          />
        </div>
      )}
    </div>
  );
});