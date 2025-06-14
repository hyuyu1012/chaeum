import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

// Get screen width to dynamically adjust chart size.
const screenWidth = Dimensions.get("window").width;

// Define the type for aggregated nutrition data.
// Although all nutrition fields will be aggregated as numbers,
// they are kept as strings here since the original data is string,
// and converted to numbers during rendering.
type AggregatedNutritionData = {
  "에너지(kcal)": string;
  "탄수화물(g)": string;
  "단백질(g)": string;
  "지방(g)": string;
  "당류(g)": string;
  "칼슘(mg)": string;
  "철(mg)": string;
  "인(mg)": string;
  "칼륨(mg)": string;
  "비타민 A(μg RAE)": string;
  "비타민 C(mg)": string;
  "비타민 D(μg)": string;
};

type NutritionStatisticsProps = {
  aggregatedData: AggregatedNutritionData;
};

const NutritionStatistics: React.FC<NutritionStatisticsProps> = ({ aggregatedData }) => {
  // aggregatedData가 유효한지 확인하여 undefined 또는 null일 경우 오류 방지
  if (!aggregatedData) {
    console.error("aggregatedData prop is null or undefined in NutritionStatistics.");
    return (
      <View style={styles.container}>
        <Text style={styles.title}>데이터 로딩 중 또는 없음</Text>
        <Text>영양 성분 통계를 표시할 수 없습니다.</Text>
      </View>
    );
  }

  // Chart data (main 4 nutrients)
  const chartLabels = ["에너지(kcal)", "탄수화물(g)", "단백질(g)", "지방(g)"];
  // aggregatedData[label]이 undefined 또는 null일 경우 '0'으로 폴백 처리하여 안전하게 parseFloat
  const chartValues = chartLabels.map(label => 
    parseFloat(aggregatedData[label as keyof AggregatedNutritionData] ?? '0')
  );

  const barChartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        colors: [ // Color for each bar
          (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Energy: Red
          (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // Carbohydrates: Blue
          (opacity = 1) => `rgba(75, 192, 192, ${opacity})`, // Protein: Green
          (opacity = 1) => `rgba(255, 206, 86, ${opacity})`, // Fat: Yellow
        ],
      },
    ],
  };

  // Define general chart settings.
  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: "#ffffff",
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label and axis color
    strokeWidth: 2, // Graph line thickness
    barPercentage: 0.5, // Bar width ratio
    useShadowColorFromDataset: false, // Do not use shadow color from dataset
    decimalPlaces: 0, // Decimal places for y-axis labels
    propsForLabels: { // Label text style
      fontSize: 10,
      fontWeight: 'bold',
      fill: 'black',
    },
    fillShadowGradient: 'rgba(0,0,0,0.1)', // Bar shadow color
    fillShadowGradientOpacity: 1, // Bar shadow opacity
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>총 영양 성분 통계</Text>

      {/* Main nutrient bar chart */}
      <View style={styles.chartWrapper}>
        <Text style={styles.chartTitle}>주요 영양소 막대 그래프 (총량)</Text>
        <BarChart
          style={styles.chart}
          data={barChartData}
          width={screenWidth - 40} // Exclude padding from screen width
          height={250}
          yAxisLabel=""
          yAxisSuffix=" " // Add yAxisSuffix to resolve the error
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          fromZero={true}
          showValuesOnTopOfBars={true}
        />
      </View>

      {/* Detailed list of all nutrients */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>모든 영양소 상세</Text>
        {Object.entries(aggregatedData).map(([key, value]) => (
          <Text key={key} style={styles.detailText}>
            {key}: {value}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  chartWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#444',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  detailText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
  },
});

export default NutritionStatistics;
