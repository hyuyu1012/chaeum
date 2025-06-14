import { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Food = {
  [key: string]: string;
};

type FoodData = {
  records: Food[];
};

const foodData: FoodData = require('../../assets/data.json');

export default function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Food | null>(null);

  const handleSearch = () => {
    const food = foodData.records.find(f => f["식품명"].includes(input));
    setResult(food || null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>음식 영양정보 조회기</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 토스트(식빵)"
        onChangeText={setInput}
        value={input}
      />
      <Button title="검색" onPress={handleSearch} />
      {result && (
        <View>
          <Text>식품명: {result["식품명"]}</Text>
          <Text>에너지: {result["에너지(kcal)"]} kcal</Text>
          <Text>탄수화물: {result["탄수화물(g)"]} g</Text>
          <Text>단백질: {result["단백질(g)"]} g</Text>
          <Text>당류: {result["당류(g)"]} g</Text>
          <Text>칼슘: {result["칼슘(mg)"]} mg</Text>
          <Text>철: {result["철(mg)"]} mg</Text>
          <Text>인: {result["인(mg)"]} mg</Text>
          <Text>칼륨: {result["칼륨(mg)"]} mg</Text>
          <Text>비타민 A: {result["비타민 A(μg RAE)"]} μg RAE</Text>
          <Text>비타민 C: {result["비타민 C(mg)"]} mg</Text>          
          <Text>비타민 D: {result["비타민 D(μg)"]} μg</Text>          
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
});
