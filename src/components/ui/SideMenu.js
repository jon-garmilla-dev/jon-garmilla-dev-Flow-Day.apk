import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

import CustomDrawerContent from "../navigation/CustomDrawerContent";

const { width: screenWidth } = Dimensions.get("window");
const menuWidth = screenWidth * 0.75;

const SideMenu = forwardRef(({ isOpen, isPreviewing, onClose }, ref) => {
  const slideAnim = useRef(new Animated.Value(-menuWidth)).current;
  const isDragging = useRef(false);

  useImperativeHandle(ref, () => ({
    setSmoothPosition: (progress, dx) => {
      isDragging.current = true;
      const targetPosition = -menuWidth + menuWidth * progress;
      slideAnim.setValue(targetPosition);
    },
    stopDragging: () => {
      isDragging.current = false;
    },
  }));

  useEffect(() => {
    if (isDragging.current) return;

    const animationConfig = {
      tension: 80,
      friction: 12,
      useNativeDriver: true,
    };

    if (isOpen && !isPreviewing) {
      Animated.spring(slideAnim, { toValue: 0, ...animationConfig }).start();
    } else if (!isOpen && !isPreviewing) {
      Animated.spring(slideAnim, {
        toValue: -menuWidth,
        ...animationConfig,
      }).start();
    }
  }, [isOpen, isPreviewing, slideAnim]);

  // If not visible, don't render anything to avoid capturing touches
  if (!isOpen && !isPreviewing) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Overlay clickable que cierra el menú */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Contenedor del menú animado */}
      <Animated.View
        style={[
          styles.menuContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {/* Wrapper para que los toques dentro del menú no lo cierren */}
        <TouchableWithoutFeedback>
          <View style={{ flex: 1 }}>
            <CustomDrawerContent navigation={{ closeDrawer: onClose }} />
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContainer: {
    position: "absolute",
    width: menuWidth,
    height: "100%",
    backgroundColor: "#0d1117",
    left: 0,
    top: 0,
  },
});

export default SideMenu;
