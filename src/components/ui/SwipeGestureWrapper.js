import React, { useRef } from 'react';
import { View, Dimensions, PanResponder } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const SwipeGestureWrapper = ({ children, onSwipeLeft, onSwipeRight, onPanMove, onPanStart, onPanEnd, isSideMenuOpen }) => {
  const gestureStartX = useRef(0);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { dx, dy, x0 } = gestureState;

      if (Math.abs(dy) > Math.abs(dx) * 1.5) {
        return false;
      }

      const edgeZone = 120;
      if (isSideMenuOpen || x0 < edgeZone) {
        return Math.abs(dx) > 2;
      }
      
      return false;
    },
    
    onPanResponderGrant: (evt, gestureState) => {
      gestureStartX.current = gestureState.x0;
      if (onPanStart) onPanStart();
    },
    
    onPanResponderMove: (evt, gestureState) => {
      if (onPanMove) onPanMove(gestureState);
    },
    
    onPanResponderRelease: (evt, gestureState) => {
      if (onPanEnd) onPanEnd(gestureState);
    },
    onPanResponderTerminate: (evt, gestureState) => {
      if (onPanEnd) onPanEnd(gestureState);
    }
  });

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

export default SwipeGestureWrapper;
