import * as ImagePicker from 'expo-image-picker';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text,Alert, Platform, TouchableOpacity, View, Pressable, Modal, TextInput, Image, FlatList} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Calendar from '../Calendar'; // CalendarStrip 포함된 컴포넌트

import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'A props object containing a "key" prop is being spread into JSX',
]);
type Item = {
  date: string;
  imageUri: string;
  mealType: string;
  text: string;
};

export default function index() {

  const [items, setItems] = useState<Item[]>([]); // 아이템 리스트
  const [modalVisible, setModalVisible] = useState(false); // 모달 상태
  const [imageUri, setImageUri] = useState<string | null>(null); // 이미지 url
  const [text, setText] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(moment()); // 날짜 선택
  const [mealType, setMealType] = useState('breakfast');  // radiobutton option 선택
  const [predictName, setPredictName] = useState(null);

  const mealOptions = [
    { label: '아침', value: '아침' },
    { label: '아점', value: '아점' },
    { label: '점심', value: '점심' },
    { label: '저녁', value: '저녁' },
    { label: '간식', value: '간식' },
    { label: '기타', value: 'etc' },
  ];

  const filteredItems = items.filter(
    (item) => item.date === selectedDate.format('YYYY-MM-DD')
  );

  const openModal = (index: number | null = null) => {
    if (index !== null) {
      const item = filteredItems[index];
      setEditIndex(index);
      setImageUri(item.imageUri);
      setText(item.text);
    } else {
      setEditIndex(null);
      setImageUri(null);
      setText('');
    }
    setModalVisible(true);
  };

  const saveItem = () => {
    if (!imageUri) return;

    const newItem: Item = {
      imageUri,
      text,
      date: selectedDate.format('YYYY-MM-DD'),
      mealType
    };

    const newItems = [...items];

    if (editIndex !== null) {
      // filteredItems 기준 editIndex를 전체 items 인덱스로 변환
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const indices = items
        .map((item, i) => (item.date === dateStr ? i : -1))
        .filter(i => i !== -1);

      const targetIndex = indices[editIndex];
      if (targetIndex !== undefined) {
        newItems[targetIndex] = newItem;
      }
    } else {
      newItems.push(newItem);
    }

    setItems(newItems);
    setModalVisible(false);
    setImageUri(null);
    setText('');
    setEditIndex(null);
  };

  const deleteItem = (index: number) => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const indices = items
      .map((item, i) => (item.date === dateStr ? i : -1))
      .filter(i => i !== -1);

    const targetIndex = indices[index];

    if (targetIndex !== undefined) {
      const newItems = [...items];
      newItems.splice(targetIndex, 1);
      setItems(newItems);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: false,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      console.log('Selected Image URI:', selectedUri);
      setImageUri(selectedUri);
    }
  };

  const uploadToServer = async () => {
    if (!imageUri) {
      Alert.alert('이미지를 선택해주세요');
      return;
    }

    let fileToUpload;

    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      fileToUpload = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
    } else {
      fileToUpload = {
        uri: imageUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      };
    }

    const formData = new FormData();
    formData.append('file', fileToUpload as any);

  try {
    const res = await fetch('http://172.16.83.18:8000/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    console.log('Upload success:', data);

    if (data.predicted_class) {
      // 여기서 predicted_class 값을 사용
      console.log('예측된 클래스:', data.predicted_class);
      Alert.alert('예측 결과', `클래스: ${data.predicted_class}`);
      setPredictName(data.predicted_class);  // 👈 상태 저장
      setText(data.predicted_class)

    } else {
      Alert.alert('업로드 성공', '예측 결과가 없습니다.');
    }
  } catch (err) {
    console.error('Upload failed:', err);
    Alert.alert('업로드 실패', String(err));
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <Calendar onDateChange={setSelectedDate} />
      <Text style={styles.datetext}>{selectedDate.format('YYYY년 MM월 DD일')}</Text>

    <FlatList
      data={filteredItems}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
      renderItem={({ item, index }) => (
        <View style={styles.card}>
          <Text style={styles.mealTypeText}>{item.mealType}</Text>
          <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
          <Text style={styles.cardText}>{item.text}</Text>
          <View style={styles.cardButtonRow}>
           <TouchableOpacity onPress={() => deleteItem(index)} style={styles.cardButton}>
              <Text style={[styles.cardButtonText, { color: '#FF3B30' }]}>삭제</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openModal(index)} style={styles.cardButton}>
              <Text style={[styles.cardButtonText, { color: '#029673' }]}>수정</Text>
            </TouchableOpacity>
    
          </View>
        </View>
      )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalWrap}>
    <View style={styles.modal}>
            <Text style={styles.label}>이미지</Text>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.preview}
                resizeMode="cover"
              />
            ) : (
              <TouchableOpacity activeOpacity={0.7} style={styles.imagePlaceholder} onPress={pickImage}>
                <Text style={styles.placeholderText}>이미지를 선택해주세요</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.label}>음식명</Text>
           <TextInput
              key={text}  // key가 바뀌면 강제로 리렌더됨
              value={text}
              onChangeText={setText}
              placeholder="음식명을 입력하세요"
              style={styles.input}
            />

            <Text style={styles.label}>식사 종류</Text>
            <View style={styles.mealTypeContainer}>
              {mealOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setMealType(option.value)}
                  style={[
                    styles.button,
                    mealType === option.value && styles.selectedButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.btn_text,
                      mealType === option.value && styles.selectedText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>


            <TouchableOpacity style={styles.button} onPress={uploadToServer}>
              <Text>업로드</Text>
            </TouchableOpacity>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveItem}>
                <Text style={styles.saveText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor:'#fff'}, 
    datetext: {fontSize:20, marginTop:20, marginLeft:20, fontWeight:"700"},
  //modal 
  modalWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },  
  modal: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 5,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    color: '#aaa',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  button: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedButton: {
    backgroundColor: '#029673',
    borderColor: '#029673',
  },
  btn_text: {
    fontSize: 12,
    color: '#000',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#029673',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,

  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#333',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#029673',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    padding: 12,
    // iOS 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android 그림자
    elevation: 3,
  },
  
  cardImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  cardButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 16,
  },
  cardButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cardButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mealTypeText: {
    marginBottom : 10,
    fontSize: 18,
    fontWeight: '600',
  },
});


