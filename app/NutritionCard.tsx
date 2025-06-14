// NutritionCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type NutritionProps = {
  data: {
    
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
  };
};

const NutritionCard: React.FC<NutritionProps> = ({ data }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>영양 성분표</Text>
      <Text>에너지: {data["에너지(kcal)"]} kcal</Text>
      <Text>탄수화물: {data["탄수화물(g)"]} g</Text>
      <Text>단백질: {data["단백질(g)"]} g</Text>
      <Text>당류: {data["당류(g)"]} g</Text>
      <Text>칼슘: {data["칼슘(mg)"]} mg</Text>
      <Text>철: {data["철(mg)"]} mg</Text>
      <Text>인: {data["인(mg)"]} mg</Text>
      <Text>칼륨: {data["칼륨(mg)"]} mg</Text>
      <Text>비타민 A: {data["비타민 A(μg RAE)"]} μg RAE</Text>
      <Text>비타민 C: {data["비타민 C(mg)"]} mg</Text>
      <Text>비타민 D: {data["비타민 D(μg)"]} μg</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    marginVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default NutritionCard;