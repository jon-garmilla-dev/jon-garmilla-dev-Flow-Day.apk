import React, { useState, createContext, useContext, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SwipeGestureWrapper from '../ui/SwipeGestureWrapper';
import SideMenu from '../ui/SideMenu';

const { width: screenWidth } = Dimensions.get('window');
const menuWidth = screenWidth * 0.75;

const PageLayoutContext = createContext();
export const usePageLayout = () => useContext(PageLayoutContext);

const PageLayout = ({ children }) => {
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
      >
        <View style={styles.container}>
          {children}
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
