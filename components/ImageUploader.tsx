import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '~/utils/supabase';

interface ImageUploaderProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  initialImages?: string[];
}

export default function ImageUploader({ onImagesUploaded, initialImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    try {
      // Request permissions
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required to take photos.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Gallery permission is required to select photos.');
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);

      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate unique filename
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `property-images/${filename}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('properties')
        .upload(filePath, blob);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('properties')
        .getPublicUrl(filePath);

      // Update state and notify parent
      const newImages = [...images, publicUrl];
      setImages(newImages);
      onImagesUploaded(newImages);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUploaded(newImages);
  };

  return (
    <View className="w-full">
      <View className="flex-row justify-between mb-4">
        <TouchableOpacity
          className="flex-1 mr-2 bg-blue-500 rounded-lg p-3 flex-row items-center justify-center"
          onPress={() => takePhoto()}
          disabled={uploading}
        >
          <Ionicons name="camera-outline" size={20} color="white" />
          <Text className="text-white font-medium ml-2">Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="flex-1 ml-2 bg-blue-500 rounded-lg p-3 flex-row items-center justify-center"
          onPress={() => pickImage(false)}
          disabled={uploading}
        >
          <Ionicons name="images-outline" size={20} color="white" />
          <Text className="text-white font-medium ml-2">Choose Photo</Text>
        </TouchableOpacity>
      </View>

      {uploading && (
        <View className="items-center justify-center py-4">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-2">Uploading image...</Text>
        </View>
      )}

      {images.length > 0 && (
        <View className="flex-row flex-wrap">
          {images.map((image, index) => (
            <View key={index} className="relative m-1">
              <Image
                source={{ uri: image }}
                className="w-24 h-24 rounded-lg"
              />
              <TouchableOpacity
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
} 