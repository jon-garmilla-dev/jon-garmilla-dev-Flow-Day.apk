import React, { useState, createContext, useContext, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import SwipeGestureWrapper from '../ui/SwipeGestureWrapper';
import SideMenu from '../ui/SideMenu';

const { width: screenWidth } = Dimensions.get('window');
const menuWidth = screenWidth * 0.75;

const PageLayoutContext = createContext();
export const usePageLayout = () => useContext(PageLayoutContext);

const PageLayout = ({ children }) => {
  const router = useRouter();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const sideMenuRef = useRef(null);
  const isGestureActive = useRef(false);

  const handlePanStart = () => {
    isGestureActive.current = true;
  };

  const handlePanEnd = (gestureState) => {
    isGestureActive.current = false;
    sideMenuRef.current?.stopDragging();

    const { dx, vx } = gestureState;
    
    if (isPreviewing) {
      if (dx > screenWidth * 0.3 || vx > 0.5) {
        setIsSideMenuOpen(true);
      }
    } else if (isSideMenuOpen) {
      if (dx < -screenWidth * 0.3 || vx < -0.5) {
        setIsSideMenuOpen(false);
      }
    }
    setIsPreviewing(false);
  };

  const handlePanMove = (gestureState) => {
    const { dx, x0 } = gestureState;
    if (!isGestureActive.current) return;

    const edgeThreshold = 80;
    const dragOpenThreshold = screenWidth * 0.75;

    if (isSideMenuOpen) {
      const progress = Math.max(0, Math.min(1, (dx + menuWidth) / menuWidth));
      sideMenuRef.current?.setSmoothPosition(progress, dx);
    } else {
      if (x0 < edgeThreshold && dx > 0) {
        if (!isPreviewing) setIsPreviewing(true);
        const progress = Math.max(0, Math.min(1, dx / dragOpenThreshold));
        sideMenuRef.current?.setSmoothPosition(progress, dx);
      }
    }
  };

  const openMenu = () => {
    setIsPreviewing(false);
    setIsSideMenuOpen(true);
  };
  const closeMenu = () => {
    setIsPreviewing(false);
    setIsSideMenuOpen(false);
  };

  return (
    <PageLayoutContext.Provider value={{ openMenu }}>
      <SwipeGestureWrapper
        onPanStart={handlePanStart}
        onPanMove={handlePanMove}
        onPanEnd={handlePanEnd}
        isSideMenuOpen={isSideMenuOpen}
        onSwipeLeft={() => {
          if (router.canGoBack()) {
            router.back();
          }
        }}
      >
        <View style={styles.container}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#0d1117' }} edges={['top', 'left', 'right']}>
            <StatusBar style="light" />
            {children}
          </SafeAreaView>
          <SideMenu 
            ref={sideMenuRef} 
            isOpen={isSideMenuOpen} 
            isPreviewing={isPreviewing} 
            onClose={closeMenu} 
          />
        </View>
      </SwipeGestureWrapper>
    </PageLayoutContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PageLayout;
