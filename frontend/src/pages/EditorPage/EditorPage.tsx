import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './EditorPage.module.css';

import { CanvasEditor, type CanvasEditorHandle, type ImageState } from '../../components/CanvasEditor/CanvasEditor';
import { EditorActionButton } from '../../components/EditorActionButton/EditorActionButton';
import { Toolbar } from '../../components/Toolbar/Toolbar';
import { ToolbarButton } from '../../components/ToolbarButton/ToolbarButton';
import { HistoryControls } from '../../components/HistoryControls/HistoryControls';
import { Slider } from '../../components/Slider/Slider';
import { useEditorActions } from '../../hooks/useEditorActions';
import { useEditorHistory } from '../../hooks/useEditorHistory';

import back from '../../assets/back.svg';
import save from '../../assets/save.svg';
import download from '../../assets/download.svg';
import crop from '../../assets/crop.svg';
import brightness from '../../assets/brightness.svg';
import definition from '../../assets/definition.svg';
import blur from '../../assets/blur.svg';
import bg from '../../assets/bg.svg';

export const EditorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { imageUrl, photoId } = location.state || {};
  
  const canvasRef = useRef<CanvasEditorHandle>(null);
  
  const { undo, redo, push, reset: resetHistory } = useEditorHistory<ImageState>(null); 

  const [activeTool, setActiveTool] = useState('none');
  const [activeRatio, setActiveRatio] = useState<string>('free');

  const [zoomValue, setZoomValue] = useState(50);
  const [brightnessValue, setBrightnessValue] = useState(0);
  const [definitionValue, setDefinitionValue] = useState(0);
  const [blurValue, setBlurValue] = useState(0);

  const { handleSave, handleDownload } = useEditorActions(imageUrl, photoId);

  const handleImageLoaded = (initialState: ImageState) => {
    resetHistory(initialState);
  };

  const handleToolChange = (tool: string) => {
    const nextTool = activeTool === tool ? 'none' : tool;
    setActiveTool(nextTool);
    canvasRef.current?.setToolMode(nextTool);
    if (nextTool === 'none') {
      setActiveRatio('free');
    }
  };

  const handleSliderChange = (val: number) => {
    if (activeTool === 'none') {
      setZoomValue(val);
      canvasRef.current?.setZoom(val);
    } else if (activeTool === 'brightness') {
      setBrightnessValue(val);
      canvasRef.current?.applyFilter('brightness', val);
    } else if (activeTool === 'definition') {
      setDefinitionValue(val);
      canvasRef.current?.applyFilter('definition', val);
    } else if (activeTool === 'blur') {
      setBlurValue(val);
      canvasRef.current?.applyFilter('blur', val);
    }
  };

  const finalizeAction = () => {
    const state = canvasRef.current?.getCurrentState();
    if (state) push(state);
  };

  const syncStates = (syncData: any) => {
    setBrightnessValue(syncData.brightness);
    setDefinitionValue(syncData.definition);
    setBlurValue(syncData.blur);
    setZoomValue(syncData.zoom);
  };

  const handleUndo = async () => {
    const state = undo();
    if (state) {
      try {
        const syncData = await canvasRef.current?.loadState(state);
        if (syncData) syncStates(syncData);
      } catch (err) {
        console.error("Ошибка отмены действия", err);
      }
    }
  };

  const handleRedo = async () => {
    const state = redo();
    if (state) {
      try {
        const syncData = await canvasRef.current?.loadState(state);
        if (syncData) syncStates(syncData);
      } catch (err) {
        console.error("Ошибка повтора действия", err);
      }
    }
  };

  const handleConfirmCrop = () => {
    canvasRef.current?.confirmCrop();
    setActiveTool('none');
    setActiveRatio('free');
    finalizeAction();
  };

  const handleCancelCrop = () => {
    canvasRef.current?.setToolMode('none');
    setActiveTool('none');
    setActiveRatio('free');
  };

  const handleRatioChange = (ratioName: string, ratioValue: number | null) => {
    setActiveRatio(ratioName);
    canvasRef.current?.setCropAspectRatio(ratioValue);
  };

  const currentSliderValue = 
    activeTool === 'none' ? zoomValue :
    activeTool === 'brightness' ? brightnessValue :
    activeTool === 'definition' ? definitionValue :
    activeTool === 'blur' ? blurValue : 0;

  const currentMin = 
    activeTool === 'none' ? 10 :
    activeTool === 'brightness' ? -100 :
    activeTool === 'definition' ? -100 :
    activeTool === 'blur' ? 0 : 0;

  const currentMax = 100;

  return (
    <div className={styles.container}>
      <div className={styles.canvasWrapper}>
        {imageUrl ? (
          <CanvasEditor 
            ref={canvasRef} 
            imageUrl={imageUrl} 
            onImageLoaded={handleImageLoaded} 
          />
        ) : (
          <div className={styles.empty}>Изображение не загружено</div>
        )}
      </div>

       <div className={styles.topBar}>
          <EditorActionButton icon={back} onClick={() => navigate('/account')} altText="Назад" />
          <div className={styles.topActionsRight}>
            <EditorActionButton 
              icon={save} 
              onClick={() => handleSave(canvasRef.current?.exportImage())} 
              altText="Сохранить" 
            />
            <EditorActionButton 
              icon={download} 
              onClick={() => handleDownload(canvasRef.current?.exportImage())} 
              altText="Скачать" 
            />
          </div>
        </div>

      <div className={styles.bottomPanel}>
        {activeTool === 'crop' ? (
          <div className={styles.cropActions}>
            <button className={styles.cropCancelBtn} onClick={handleCancelCrop}>
              Отмена
            </button>
            <button className={styles.cropConfirmBtn} onClick={handleConfirmCrop}>
              Обрезать (оставить выделенное)
            </button>
          </div>
        ) : (
          <Slider 
            value={currentSliderValue} 
            min={currentMin}
            max={currentMax}
            onChange={handleSliderChange} 
            onAfterChange={finalizeAction}
          />
        )}
        
        <div className={styles.controlsRow}>
          {activeTool !== 'crop' && (
            <div className={styles.historyWrapper}>
              <HistoryControls onUndo={handleUndo} onRedo={handleRedo} />
            </div>
          )}
          
          {activeTool === 'crop' ? (
            <Toolbar>
              <button 
                className={`${styles.ratioBtn} ${activeRatio === 'free' ? styles.ratioBtnActive : ''}`}
                onClick={() => handleRatioChange('free', null)}
              >
                Свободно
              </button>
              <button 
                className={`${styles.ratioBtn} ${activeRatio === '1:1' ? styles.ratioBtnActive : ''}`}
                onClick={() => handleRatioChange('1:1', 1)}
              >
                1:1
              </button>
              <button 
                className={`${styles.ratioBtn} ${activeRatio === '16:9' ? styles.ratioBtnActive : ''}`}
                onClick={() => handleRatioChange('16:9', 16 / 9)}
              >
                16:9
              </button>
              <button 
                className={`${styles.ratioBtn} ${activeRatio === '4:3' ? styles.ratioBtnActive : ''}`}
                onClick={() => handleRatioChange('4:3', 4 / 3)}
              >
                4:3
              </button>
              <button 
                className={`${styles.ratioBtn} ${activeRatio === '3:2' ? styles.ratioBtnActive : ''}`}
                onClick={() => handleRatioChange('3:2', 3 / 2)}
              >
                3:2
              </button>
            </Toolbar>
          ) : (
            <Toolbar>
              <ToolbarButton icon={crop} onClick={() => handleToolChange('crop')} isActive={activeTool === 'crop'} altText="Обрезать" />
              <ToolbarButton icon={brightness} onClick={() => handleToolChange('brightness')} isActive={activeTool === 'brightness'} altText="Яркость" />
              <ToolbarButton icon={definition} onClick={() => handleToolChange('definition')} isActive={activeTool === 'definition'} altText="Четкость" />
              <ToolbarButton icon={blur} onClick={() => handleToolChange('blur')} isActive={activeTool === 'blur'} altText="Размытие" />
              <ToolbarButton icon={bg} onClick={() => handleToolChange('bg')} isActive={activeTool === 'bg'} altText="Фон" />
            </Toolbar>
          )}
        </div>
      </div>
    </div>
  );
};