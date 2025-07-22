import React, { useRef } from "react";
import { View, Dimensions, PanResponder } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const SwipeGestureWrapper = ({
  children,
  onSwipeLeft,
  onPanMove,
  onPanStart,
  onPanEnd,
  isSideMenuOpen,
}) => {
  const gestureStartX = useRef(0);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { dx, dy, x0 } = gestureState;

      // Ignore if it's a vertical scroll
      if (Math.abs(dy) > Math.abs(dx) * 1.5) {
        return false;
      }

      const edgeZone = 80; // Activation zone at the edges

      // Activate if the menu is already open (to close it)
      if (isSideMenuOpen) {
        // Only capture if it's a real swipe, not just a tap.
        return Math.abs(gestureState.dx) > 5;
      }

      // Activate if the gesture starts on the left edge (to open the menu)
      // Or if it starts on the right edge (to go back)
      if (x0 < edgeZone || x0 > screenWidth - edgeZone) {
        return Math.abs(dx) > 5;
      }

      return false;
    },

    onPanResponderGrant: (evt, gestureState) => {
      gestureStartX.current = gestureState.x0;
      if (onPanStart) onPanStart(gestureState);
    },

    onPanResponderMove: (evt, gestureState) => {
      if (onPanMove) onPanMove(gestureState);
    },

    onPanResponderRelease: (evt, gestureState) => {
      const { dx, vx } = gestureState;
      const edgeZone = 80;

      // "Back" gesture: Starts on the right and moves left
      if (
        gestureStartX.current > screenWidth - edgeZone &&
        dx < -50 &&
        vx < -0.5
      ) {
        if (onSwipeLeft) {
          onSwipeLeft();
          return;
        }
      }

      // If it's not a "back" gesture, pass it to PageLayout to manage the menu
      if (onPanEnd) onPanEnd(gestureState);
    },
    onPanResponderTerminate: (evt, gestureState) => {
      if (onPanEnd) onPanEnd(gestureState);
    },
  });

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

export default SwipeGestureWrapper;
