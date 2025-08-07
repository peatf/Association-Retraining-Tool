// Asset Preloader - Progressive loading system for garden assets
// Loads critical assets first, then step-specific assets as needed

import React, { useState, useEffect, useCallback } from 'react';
import type { AssetManifest, LoadingProgress, StepType } from '../../context/GardenStateTypes';

interface AssetPreloaderProps {
  onLoadingComplete?: () => void;
  onLoadingProgress?: (progress: LoadingProgress) => void;
  showProgress?: boolean;
}

// Asset manifest defining what to load for each step
const ASSET_MANIFEST: AssetManifest = {
  critical: [
    '/assets/night_sky_bg.png',
    '/assets/clouds_layer_back.png',
    '/assets/clouds_layer_front.png',
    '/assets/star_twinkle_static.png',
  ],
  step1: [
    '/assets/gate_open_base.svg',
    '/assets/gate_partial_base.svg',
    '/assets/gate_closed_base.svg',
    '/assets/gate_open_glow.png',
    '/assets/gate_partial_glow.png',
    '/assets/gate_closed_glow.png',
    '/assets/gate_vines_wideopen.webm',
    '/assets/gate_vines_partial.webm',
    '/assets/gate_vines_closed.webm',
  ],
  step2: [
    '/assets/sky_to_map_overlay.png',
    '/assets/map_world_overview.png',
    '/assets/map_world_pickerzoomed.png',
    '/assets/path_picker_money.png',
    '/assets/path_picker_relationships.png',
    '/assets/path_picker_selfimage.png',
    '/assets/path_picker_money.webm',
    '/assets/path_picker_relationships.webm',
    '/assets/path_picker_selfimage.webm',
  ],
  step3: [
    '/assets/field_money_bg.png',
    '/assets/field_relationship_bg.png',
    '/assets/field_selfimage_bg.png',
    '/assets/petal_drift_overlay.webm',
    '/assets/journal_page_bg.png',
  ],
  step4: [
    '/assets/flower_money_bud.png',
    '/assets/flower_money_neutral.png',
    '/assets/flower_money_fullbloom.png',
    '/assets/flower_relationship_bud.png',
    '/assets/flower_relationships_neutral.png',
    '/assets/flower_relationship_fullbloom.png',
    '/assets/flower_selfimage_bud.png',
    '/assets/flower_selfimage_neutral.png',
    '/assets/flower_selfimage_fullbloom.png',
    '/assets/flower_roots_dynamic.webm',
    '/assets/icon_magnifying_glass.png',
    '/assets/icon_watering_can.png',
    '/assets/icon_pruning_shears.png',
  ],
  step5: [
    '/assets/dial_base.png',
    '/assets/dial_knob.png',
    '/assets/sunlight_overlay_low.png',
    '/assets/sunlight_overlay_mid.png',
    '/assets/sunlight_overlay_high.png',
    '/assets/bouquet_holder.png',
    ...Array.from({ length: 16 }, (_, i) => `/assets/picker_flower_generic${i + 1}.png`),
  ],
  decorative: [
    '/assets/flower_money_wilted.png',
    '/assets/flower_relationships_wilted.png',
    '/assets/flower_selfimage_wilted.png',
    '/assets/flower_roots_static.png',
    '/assets/gardenpath_background.png',
    '/assets/mining_petal_button_1.png',
    '/assets/mining_petal_button_2.png',
    '/assets/mining_petal_button_3.png',
    '/assets/mining_petal_button_4.png',
    '/assets/mining_petal_button_5.png',
  ],
};

const AssetPreloader: React.FC<AssetPreloaderProps> = ({
  onLoadingComplete,
  onLoadingProgress,
  showProgress = true,
}) => {
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    total: 0,
    loaded: 0,
    currentAsset: '',
    progress: 0,
    errors: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadedAssets, setLoadedAssets] = useState<Set<string>>(new Set());

  // Preload a single asset with error handling
  const preloadAsset = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const isVideo = url.endsWith('.webm') || url.endsWith('.mp4');
      const isImage = !isVideo;

      if (isImage) {
        const img = new Image();
        img.onload = () => {
          setLoadedAssets(prev => new Set(prev).add(url));
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${url}`);
          reject(new Error(`Failed to load image: ${url}`));
        };
        img.src = url;
      } else {
        const video = document.createElement('video');
        video.oncanplaythrough = () => {
          setLoadedAssets(prev => new Set(prev).add(url));
          resolve();
        };
        video.onerror = () => {
          console.warn(`Failed to load video: ${url}`);
          reject(new Error(`Failed to load video: ${url}`));
        };
        video.preload = 'metadata';
        video.src = url;
      }
    });
  }, []);

  // Preload an array of assets with progress tracking
  const preloadAssets = useCallback(async (assets: string[]): Promise<void> => {
    const total = assets.length;
    let loaded = 0;

    setLoadingProgress(prev => ({
      ...prev,
      total,
      loaded: 0,
      progress: 0,
    }));

    for (const asset of assets) {
      try {
        setLoadingProgress(prev => ({
          ...prev,
          currentAsset: asset,
        }));

        await preloadAsset(asset);
        loaded++;

        setLoadingProgress(prev => ({
          ...prev,
          loaded,
          progress: Math.round((loaded / total) * 100),
        }));

        onLoadingProgress?.({
          total,
          loaded,
          currentAsset: asset,
          progress: Math.round((loaded / total) * 100),
          errors: loadingProgress.errors,
        });
      } catch (error) {
        console.warn(`Asset loading failed: ${asset}`, error);
        setLoadingProgress(prev => ({
          ...prev,
          errors: [...prev.errors, asset],
        }));
        // Continue loading other assets even if one fails
        loaded++;
      }
    }
  }, [preloadAsset, onLoadingProgress, loadingProgress.errors]);

  // Preload assets for a specific step
  const preloadStep = useCallback(async (step: StepType): Promise<void> => {
    const stepAssets = ASSET_MANIFEST[step] || [];
    await preloadAssets(stepAssets);
  }, [preloadAssets]);

  // Initialize critical assets loading on mount
  useEffect(() => {
    const loadCriticalAssets = async () => {
      try {
        setIsLoading(true);
        
        // Load critical assets first
        await preloadAssets(ASSET_MANIFEST.critical);
        
        // Then load step 1 assets (night sky)
        await preloadStep('step1');
        
        setIsLoading(false);
        onLoadingComplete?.();
        
        // Preload other steps in the background
        setTimeout(() => {
          preloadStep('step2');
        }, 1000);
        
        setTimeout(() => {
          preloadStep('step3');
        }, 2000);
        
        setTimeout(() => {
          preloadStep('step4');
        }, 3000);
        
        setTimeout(() => {
          preloadStep('step5');
        }, 4000);
        
        // Load decorative assets last
        setTimeout(() => {
          preloadAssets(ASSET_MANIFEST.decorative);
        }, 5000);
        
      } catch (error) {
        console.error('Critical asset loading failed:', error);
        setIsLoading(false);
        onLoadingComplete?.(); // Still proceed even if some assets fail
      }
    };

    loadCriticalAssets();
  }, [preloadAssets, preloadStep, onLoadingComplete]);

  // Expose the preload functions for external use
  React.useImperativeHandle(React.useRef(), () => ({
    preloadAssets,
    preloadStep,
    loadingProgress,
    isLoading,
    loadedAssets: Array.from(loadedAssets),
  }));

  if (!showProgress || !isLoading) {
    return null;
  }

  return (
    <div 
      className="garden-asset-preloader"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--garden-night-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-garden-dialogs)',
        color: 'var(--garden-moonlight)',
      }}
    >
      <div 
        style={{
          marginBottom: 'var(--garden-spacing-lg)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ margin: 0, marginBottom: 'var(--garden-spacing-md)' }}>
          Preparing Your Garden
        </h2>
        <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
          Loading essential assets for your therapeutic journey...
        </p>
      </div>

      <div 
        style={{
          width: '300px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 'var(--garden-radius-sm)',
          overflow: 'hidden',
          marginBottom: 'var(--garden-spacing-md)',
        }}
      >
        <div
          style={{
            width: `${loadingProgress.progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--garden-moonlight), var(--garden-glow-bright))',
            borderRadius: 'var(--garden-radius-sm)',
            transition: 'width 0.3s ease-out',
          }}
        />
      </div>

      <div style={{ textAlign: 'center', minHeight: '40px' }}>
        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
          {loadingProgress.progress}% complete
        </p>
        {loadingProgress.currentAsset && (
          <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.5, marginTop: '4px' }}>
            Loading: {loadingProgress.currentAsset.split('/').pop()}
          </p>
        )}
      </div>

      {loadingProgress.errors.length > 0 && (
        <div 
          style={{
            marginTop: 'var(--garden-spacing-lg)',
            padding: 'var(--garden-spacing-md)',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--garden-radius-md)',
            maxWidth: '300px',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.8rem', marginBottom: '8px' }}>
            Some assets couldn't be loaded ({loadingProgress.errors.length} failed)
          </p>
          <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.7 }}>
            The garden will still function with fallbacks.
          </p>
        </div>
      )}
    </div>
  );
};

// Hook for using asset preloader in components
export function useAssetPreloader() {
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    total: 0,
    loaded: 0,
    currentAsset: '',
    progress: 100,
    errors: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const preloadAssets = useCallback(async (assets: string[]) => {
    setIsLoading(true);
    // Implement preloading logic similar to component
    setIsLoading(false);
  }, []);

  const preloadStep = useCallback(async (step: StepType) => {
    const stepAssets = ASSET_MANIFEST[step] || [];
    await preloadAssets(stepAssets);
  }, [preloadAssets]);

  return {
    loadingProgress,
    isLoading,
    hasError: loadingProgress.errors.length > 0,
    preloadAssets,
    preloadStep,
  };
}

export default AssetPreloader;