import * as ImagePicker from 'expo-image-picker';
import moment from 'moment';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Calendar from '../Calendar'; // CalendarStrip 포함된 컴포넌트
import NutritionCard from '../NutritionCard'; // 경로 확인 필요
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'A props object containing a "key" prop is being spread into JSX',
]);

// NutritionCard가 기대하는 정확한 형태에 맞게 Food 타입을 정의합니다.
// data.json의 실제 필드명과 일치해야 합니다.
type Food = {
  "식품명": string;
  "에너지(kcal)": string;
  "탄수화물(g)": string;
  "단백질(g)": string;
  "당류(g)": string;
  "칼슘(mg)": string;
  "철(mg)": string;
  "인(mg)": string;
  "칼륨(mg)": string;
  "비타민 A(μg RAE)": string;
  "비타민 C(mg)": string;
  "비타민 D(μg)": string;
  [key: string]: string; // data.json에 정의된 다른 필드들을 유연하게 처리하기 위함
};

type FoodData = {
  records: Food[];
};

const foodData: FoodData = require('../../assets/data.json');

type Item = {
  date: string;
  imageUri: string;
  mealType: string;
  text: string;
  nutrition?: Food; // 각 Item이 자체 영양 정보를 가질 수 있도록 nutrition 속성 추가
};

export default function index() {
  const [items, setItems] = useState<Item[]>([]); // 아이템 리스트
  const [modalVisible, setModalVisible] = useState(false); // 모달 상태
  const [imageUri, setImageUri] = useState<string | null>(null); // 이미지 url

  const [text, setText] = useState(''); // 음식명
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(moment()); // 날짜 선택
  const [mealType, setMealType] = useState('아침');  // radiobutton option 선택 (기본값 '아침')
  const [predictName, setPredictName] = useState<string | null>(null); // 예측된 음식명
  const [result, setResult] = useState<Food | null>(null); // 현재 모달에서 검색/예측된 음식의 영양 정보 미리보기용

  const mealOptions = [
    { label: '아침', value: '아침' },
    { label: '아점', value: '아점' },
    { label: '점심', value: '점심' },
    { label: '저녁', value: '저녁' },
    { label: '간식', value: '간식' },
    { label: '기타', value: 'etc' },
  ];

  const handleSearch = () => {
    // 입력된 텍스트(음식명)로 foodData에서 영양 정보를 검색합니다.
    const food = foodData.records.find(f => f["식품명"] && f["식품명"].includes(text));
    setResult(food || null); // 검색된 영양 정보를 result 상태에 저장하여 모달 내에서 미리보기
  };

  const filteredItems = items.filter(
    (item) => item.date === selectedDate.format('YYYY-MM-DD')
  );

  const openModal = (index: number | null = null) => {
    if (index !== null) {
      const item = filteredItems[index];
      setEditIndex(index);
      setImageUri(item.imageUri);
      setText(item.text);
      setMealType(item.mealType); // 수정 시 기존 식사 종류 설정
      setResult(item.nutrition || null); // 수정 시 기존 영양 정보 미리보기로 로드
    } else {
      setEditIndex(null);
      setImageUri(null);
      setText('');
      setMealType('아침'); // 새로운 아이템 추가 시 기본 식사 종류 설정
      setPredictName(null); // 새로운 아이템 추가 시 예측 이름 초기화
      setResult(null); // 새로운 아이템 추가 시 영양 정보 미리보기 초기화
    }
    setModalVisible(true);
  };

  const saveItem = () => {
    if (!imageUri) {
      Alert.alert('저장 실패', '이미지를 선택해주세요.');
      return;
    }
    if (!text.trim()) {
      Alert.alert('저장 실패', '음식명을 입력해주세요.');
      return;
    }

    // saveItem 시점의 text를 기준으로 영양 정보를 다시 찾습니다.
    const foodNutrition = foodData.records.find(f => f["식품명"] && f["식품명"].includes(text));

    const newItem: Item = {
      imageUri,
      text,
      date: selectedDate.format('YYYY-MM-DD'),
      mealType,
      nutrition: foodNutrition // 해당 아이템의 영양 정보를 여기에 저장
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
    // 모달 닫고 상태 초기화
    setImageUri(null);
    setText('');
    setEditIndex(null);
    setPredictName(null);
    setResult(null); // 저장 후 미리보기 영양 정보 초기화
  };

  const deleteItem = (index: number) => {
    // 현재 선택된 날짜의 필터링된 아이템 리스트에서 해당 index의 실제 전체 items에서의 인덱스를 찾습니다.
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const indices = items
      .map((item, i) => (item.date === dateStr ? i : -1))
      .filter(i => i !== -1);

    const targetIndex = indices[index]; // filteredItems의 index에 해당하는 실제 items의 index

    if (targetIndex !== undefined) {
      const newItems = [...items];
      newItems.splice(targetIndex, 1); // 해당 인덱스의 아이템을 제거
      setItems(newItems);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: false, // base64는 사용하지 않으므로 false
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      console.log('Selected Image URI:', selectedUri);
      setImageUri(selectedUri);
      setText(''); // 새 이미지 선택 시 음식명 초기화
      setPredictName(null); // 예측 이름 초기화
      setResult(null); // 영양 정보 미리보기 초기화
    }
  };

  const uploadToServer = async () => {
    if (!imageUri) {
      Alert.alert('알림', '이미지를 먼저 선택해주세요.');
      return;
    }

    let fileToUpload;

    if (Platform.OS === 'web') {
      // 웹 환경에서는 URI로 blob을 가져와 File 객체로 변환
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        fileToUpload = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      } catch (error) {
        console.error('Failed to fetch image for web:', error);
        Alert.alert('업로드 실패', '이미지를 가져오는 데 실패했습니다.');
        return;
      }
    } else {
      // 네이티브 환경에서는 URI와 타입으로 파일 객체 생성
      fileToUpload = {
        uri: imageUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      };
    }

    const formData = new FormData();
    formData.append('file', fileToUpload as any); // FormData에 파일 추가

    try {
      // 서버 URL은 환경에 맞게 조정해야 합니다. (로컬 테스트용 IP)
      const res = await fetch('http://172.16.83.18:8000/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data', // FormData 사용 시 필수
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server responded with status ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log('Upload success:', data);

      if (data.predicted_class) {
        console.log('예측된 클래스:', data.predicted_class);
        Alert.alert('예측 결과', `클래스: ${data.predicted_class}`);
        setPredictName(data.predicted_class);  // 예측된 이름 상태 저장
        setText(data.predicted_class); // 예측된 이름을 음식명 TextInput에 자동 설정
        
        // 예측된 음식명으로 영양 정보 검색 및 result 상태 업데이트
        const food = foodData.records.find(f => f["식품명"] && f["식품명"].includes(data.predicted_class));
        setResult(food || null);
      } else {
        Alert.alert('업로드 성공', '예측 결과가 없습니다.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('업로드 실패', `네트워크 오류 또는 서버 응답 오류: ${String(err)}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 캘린더 컴포넌트 */}
      <Calendar onDateChange={setSelectedDate} />
      <Text style={styles.datetext}>{selectedDate.format('YYYY년 MM월 DD일')}</Text>

      {/* 아이템 목록 */}
      <FlatList
        data={filteredItems}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.mealTypeText}>{item.mealType}</Text>
            <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
            <Text style={styles.cardText}>{item.text}</Text>
            
            {/* 영양 정보 카드: 각 아이템의 nutrition 데이터를 사용 */}
            {item.nutrition && (
              <NutritionCard
                data={{
                  "에너지(kcal)": item.nutrition["에너지(kcal)"],
                  "탄수화물(g)": item.nutrition["탄수화물(g)"],
                  "단백질(g)": item.nutrition["단백질(g)"],
                  "당류(g)": item.nutrition["당류(g)"],
                  "칼슘(mg)": item.nutrition["칼슘(mg)"],
                  "철(mg)": item.nutrition["철(mg)"],
                  "인(mg)": item.nutrition["인(mg)"],
                  "칼륨(mg)": item.nutrition["칼륨(mg)"],
                  "비타민 A(μg RAE)": item.nutrition["비타민 A(μg RAE)"],
                  "비타민 C(mg)": item.nutrition["비타민 C(mg)"],
                  "비타민 D(μg)": item.nutrition["비타민 D(μg)"],
                }}
              />
            )}
            
            {/* 카드 내 버튼 */}
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

      {/* 모달 (아이템 추가/수정) */}
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
            {/* 이미지 업로드 및 음식명 검색 버튼 */}
            <TouchableOpacity style={styles.button} onPress={uploadToServer}>
              {/* handleSearch는 uploadToServer 내부에서 예측된 class로 자동 호출되도록 변경 */}
              <Text>업로드 및 영양정보 검색</Text>
            </TouchableOpacity>
            
            {/* 영양 정보 미리보기 (result 상태에 데이터가 있을 경우) */}
            {result && (
              <View style={styles.nutritionPreviewContainer}>
                <Text style={styles.nutritionPreviewTitle}>
                  {`예측/검색된 영양 정보 (${result["식품명"] || '이름 없음'})`}
                </Text>
                <Text>에너지: {result["에너지(kcal)"] || 'N/A'} kcal</Text>
                <Text>탄수화물: {result["탄수화물(g)"] || 'N/A'} g</Text>
                <Text>단백질: {result["단백질(g)"] || 'N/A'} g</Text>
                <Text>지방: {result["지방(g)"] || 'N/A'} g</Text>
                {/* 필요한 다른 영양소들도 여기에 표시 가능 */}
              </View>
            )}

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

      {/* 플로팅 액션 버튼 (FAB) */}
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
    alignItems: 'center', // 텍스트 중앙 정렬
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
  nutritionPreviewContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  nutritionPreviewTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
