import React, { useRef } from 'react';
import { View, Dimensions, PanResponder } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const SwipeGestureWrapper = ({ children, onSwipeLeft, onPanMove, onPanStart, onPanEnd, isSideMenuOpen }) => {
  const gestureStartX = useRef(0);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { dx, dy, x0 } = gestureState;

      // Ignorar si es un scroll vertical
      if (Math.abs(dy) > Math.abs(dx) * 1.5) {
        return false;
      }

      const edgeZone = 80; // Zona de activación en los bordes
      
      // Activar si el menú ya está abierto (para cerrarlo)
      if (isSideMenuOpen) {
        return true;
      }

      // Activar si el gesto empieza en el borde izquierdo (para abrir menú)
      // O si empieza en el borde derecho (para ir atrás)
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

      // Gesto para "Atrás": Empieza en la derecha y va a la izquierda
      if (gestureStartX.current > screenWidth - edgeZone && dx < -50 && vx < -0.5) {
        if (onSwipeLeft) {
          onSwipeLeft();
          return; 
        }
      }

      // Si no es un gesto para atrás, se lo pasamos al PageLayout para que gestione el menú
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
