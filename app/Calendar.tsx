import moment from 'moment'; 
import React, { useState } from 'react';
import CalendarStrip from 'react-native-calendar-strip';

//Props 정의, 이름은 CalendarProps이며 onDateChange함수를 속성으로 꼭 받아야 함(typescript 문법)
type CalendarProps = {
  onDateChange: (date: moment.Moment) => void;
};

// 함수를 외부에서 사용할 수 있게 export // onDateChange
export default function Calendar({ onDateChange }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState(moment());

  const markedDates =
    selectedDate !== null
      ? [
          {
            date: selectedDate,
            dots: [
              {
                key: 'selected',
                color: 'white',
                selectedDotColor: 'white',
              },
            ],
          },
        ]
      : [];

  return (
  <CalendarStrip
          style={{ height: 120, paddingBottom:20 ,paddingTop:10 }}
          calendarColor={'#029673'}
          calendarHeaderStyle={{ color: '#fff', fontSize: 20, opacity: 100 }}
          dateNumberStyle={{ color: '#fff', fontSize: 16 }}
          dateNameStyle={{ color: '#fff', fontSize: 16 }}
          highlightDateNumberStyle={{ color: 'white', fontSize: 16 }}
          highlightDateNameStyle={{ color: 'white', fontSize: 16 }}
          selectedDate={selectedDate ?? undefined} // null이면 undefined 전달
          markedDates={markedDates}
          onDateSelected={(date) => {
            setSelectedDate(date); // 선택한 날짜를 저장
            onDateChange(date); // 외부로 전달
          }} 
          />
    );
  
}