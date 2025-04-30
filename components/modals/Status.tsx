import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

/**
 * A reusable modal component for success and failure states
 * @param {boolean} visible - Whether the modal is visible
 * @param {string} type - 'success' or 'error'
 * @param {string} title - Title text for the modal
 * @param {string} message - Message text for the modal
 * @param {function} onClose - Function to call when modal is closed
 * @param {number} autoCloseTime - Time in ms before modal automatically closes (0 to disable)
 */
const StatusModal = ({
  visible = false,
  type = 'success',
  title = type === 'success' ? 'Success!' : 'Error!',
  message = '',
  onClose = () => {},
  autoCloseTime = 3000
}) => {
  // Animation value for icon
  const iconAnimation = React.useRef(new Animated.Value(0)).current;
  
  // Start animation when modal becomes visible
  useEffect(() => {
    if (visible) {
      iconAnimation.setValue(0);
      Animated.timing(iconAnimation, {
        toValue: 1,
        duration: 600,
        easing: Easing.elastic(1.2),
        useNativeDriver: true
      }).start();
      
      // Auto close if time is set
      if (autoCloseTime > 0) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseTime);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, autoCloseTime]);

  // Icon scale animation
  const iconScale = iconAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.2, 1]
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className={`w-4/5 rounded-2xl p-6 ${type === 'success' ? 'bg-white' : 'bg-white'}`}>
          {/* Close button */}
          <TouchableOpacity 
            onPress={onClose}
            className="absolute top-3 right-3"
          >
            <AntDesign name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          
          {/* Icon */}
          <View className="items-center justify-center mb-4">
            <Animated.View style={{ transform: [{ scale: iconScale }] }}>
              {type === 'success' ? (
                <AntDesign 
                  name="checkcircle" 
                  size={64} 
                  color="#10B981" 
                />
              ) : (
                <MaterialIcons 
                  name="error" 
                  size={64} 
                  color="#EF4444" 
                />
              )}
            </Animated.View>
          </View>
          
          {/* Content */}
          <Text className={`text-center text-xl font-bold mb-2 ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {title}
          </Text>
          
          <Text className="text-center text-gray-700 mb-4">
            {message}
          </Text>
          
          {/* Button */}
          <TouchableOpacity 
            onPress={onClose}
            className={`py-3 px-6 rounded-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          >
            <Text className="text-white text-center font-semibold">
              {type === 'success' ? 'Continue' : 'Try Again'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default StatusModal;