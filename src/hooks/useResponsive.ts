import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { breakpoints } from '../styles/common';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

export const useResponsive = (): ResponsiveInfo => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const isMobile = screenData.width < breakpoints.mobile;
  const isTablet = screenData.width >= breakpoints.mobile && screenData.width < breakpoints.desktop;
  const isDesktop = screenData.width >= breakpoints.desktop;
  const isPortrait = screenData.height > screenData.width;
  const isLandscape = screenData.width > screenData.height;

  return {
    width: screenData.width,
    height: screenData.height,
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape,
  };
};