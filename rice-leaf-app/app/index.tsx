import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';

export default function Index() {

  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View style={{ flex: 1 }} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 16 }}>
          We need your permission to show the camera
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>

      <CameraView
        style={{ flex: 1 }}
        facing={facing}
      />

      <View className="absolute top-12 w-full flex-row justify-between px-6">

        <BlurView intensity={40} tint="dark" style={styles.glass}>
          <Ionicons name="chatbubble-outline" size={26} color="white" />
        </BlurView>

        <BlurView intensity={40} tint="dark" style={styles.glass}>
          <Ionicons name="bag-outline" size={26} color="white" />
        </BlurView>
        
      </View>

      <View style={styles.controls}>

        {/*Gallery Button*/}
        <TouchableOpacity >
          <Ionicons name="images-outline" size={36} color="white" />
        </TouchableOpacity>

        {/* Shutter */}
        <TouchableOpacity className="w-20 h-20 rounded-full border-4 border-white items-center justify-center">
          <View className="w-14 h-14 bg-white rounded-full" />
        </TouchableOpacity>

        {/*Flip Camera Button*/}
        <TouchableOpacity onPress={() =>
          setFacing(facing === 'back' ? 'front' : 'back')
        }>
          <Ionicons name="camera-reverse" size={36} color="white" />
        </TouchableOpacity>


      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  text: {
    color: 'white',
    fontSize: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
   glass: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
