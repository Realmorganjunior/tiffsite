// Line 1: Replace your creator-mobile-admin/app/index.tsx file with this control center code
import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, SafeAreaView, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.0.0.1:4000';

export default function AdminScreen() {
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [title, setTitle] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- ACTION: TAKE PHOTO & UPLOAD TO SUPABASE ---
  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      setStatusMessage('Capturing photo...');
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      
      setStatusMessage('Uploading photo to Supabase...');
      
      const formData = new FormData() as any;
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `${Date.now()}-mobile-capture.jpg`,
      });

      const res = await fetch(`https://miss-tiffany-llc.onrender.com`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      if (data.success) {
        Alert.alert('Success', 'Photo uploaded to site assets successfully!');
        setStatusMessage('Photo uploaded!');
      } else {
        Alert.alert('Upload Failed', data.error);
      }
    } catch (error) {
      console.error('Photo upload failed:', error);
      Alert.alert('Error', 'Could not capture or upload photo.');
    }
  };

  // --- ACTION: GO LIVE ---
  const handleGoLive = async () => {
    if (!title || !embedUrl) {
      Alert.alert('Missing Info', 'Please enter a title and stream embed URL.');
      return;
    }

    try {
      setStatusMessage('Going live...');
      const res = await fetch(`${API_BASE_URL}/api/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, embed_url: embedUrl, is_live: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start stream');
      if (data.success) {
        setIsLive(true);
        setCurrentStreamId(data.stream.id);
        setStatusMessage('LIVE ON SITE!');
        Alert.alert('Success', 'Your site is now LIVE!');
      }
    } catch (error) {
      console.error('Starting stream failed:', error);
      Alert.alert('Error', 'Could not connect to backend server.');
    }
  };

  // --- ACTION: END STREAM ---
  const handleEndStream = async () => {
    if (!currentStreamId) return;
    try {
      const res = await fetch(`https://miss-tiffany-llc.onrender.com`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not end stream');
      if (data.success) {
        setIsLive(false);
        setStatusMessage('Stream archived to VOD gallery.');
        Alert.alert('Offline', 'Stream ended and moved to archives.');
      }
    } catch (error) {
      console.error('Ending stream failed:', error);
      Alert.alert('Error', 'Could not end broadcast.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Creator Control Center</Text>
        <Text style={styles.statusText}>{statusMessage || (isLive ? '🔴 LIVE ON SITE' : '⚪ OFFLINE')}</Text>
      </View>

      {/* CAMERA VIEWFINDER */}
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.flipButton} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
              <Text style={styles.flipText}>Flip</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>

      {/* CONTROL ACTIONS PANEL */}
      <ScrollView style={styles.controlsContainer}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButtonPhoto} onPress={handleTakePhoto}>
            <Text style={styles.actionButtonText}>📸 Take Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.liveBox}>
          <Text style={styles.sectionTitle}>Live Stream Management</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Stream Title" 
            placeholderTextColor="#777"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput 
            style={styles.input} 
            placeholder="YouTube Embed URL" 
            placeholderTextColor="#777"
            value={embedUrl}
            onChangeText={setEmbedUrl}
          />

          {!isLive ? (
            <TouchableOpacity style={styles.goLiveButton} onPress={handleGoLive}>
              <Text style={styles.goLiveText}>🔴 GO LIVE NOW</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.endLiveButton} onPress={handleEndStream}>
              <Text style={styles.endLiveText}>⏹️ END CURRENT BROADCAST</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09090b' },
  header: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#27272a' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statusText: { color: '#ef4444', fontSize: 12, marginTop: 4, fontWeight: '600' },
  cameraContainer: { height: 300, width: '100%', backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'flex-end', padding: 16 },
  flipButton: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, height: 36 },
  flipText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  controlsContainer: { flex: 1, padding: 16 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  actionButtonPhoto: { flex: 1, backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  liveBox: { backgroundColor: '#18181b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#27272a' },
  sectionTitle: { color: '#a1a1aa', fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  input: { backgroundColor: '#09090b', borderWidth: 1, borderColor: '#27272a', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 14 },
  goLiveButton: { backgroundColor: '#dc2626', padding: 16, borderRadius: 12, alignItems: 'center' },
  goLiveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  endLiveButton: { backgroundColor: '#52525b', padding: 16, borderRadius: 12, alignItems: 'center' },
  endLiveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  text: { color: '#fff', textAlign: 'center', marginBottom: 16 },
  button: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});
