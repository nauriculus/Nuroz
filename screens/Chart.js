import React from 'react';
import { View, Text } from 'react-native';
import {BarChart} from 'react-native-gifted-charts';
import { Dimensions,ScrollView } from "react-native";
const screenWidth = Dimensions.get("window").width;
import { themeColors } from '../theme';

const StatsChart = ({ results }) => {
  try {

  } catch (error) {
    console.error('Error parsing JSON:', error);
    return (
      <View>
        <Text>Error parsing data</Text>
      </View>
    );
  }

  if (!Array.isArray(results.results)) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  const uniqueResults = [];
  const dataColors = [];

  results.results.forEach((result) => {
    if (!uniqueResults.includes(result.DATA)) {
   
      uniqueResults.push(result.DATA);
    }
  });

    const pieData = [
    {value: 54, color: '#177AD5', text: '54%'},
    {value: 30, color: '#79D2DE', text: '30%', focused: true},
    {value: 26, color: '#ED6665', text: '26%'},
  ];

  function getRandomColor(label) {
    const baseRGB = parseInt(themeColors.bgLight.slice(1), 16);
    const r = (baseRGB >> 16) & 255;
    const g = (baseRGB >> 8) & 255;
    const b = baseRGB & 255;
  
    const randomizeComponent = (component) => Math.min(255, Math.max(0, component + Math.floor(Math.random() * 100 - 100 / 2)));

    const randomR = randomizeComponent(r);
    const randomG = randomizeComponent(g);
    const randomB = randomizeComponent(b);
  
   
    const i = `#${(1 << 24 | randomR << 16 | randomG << 8 | randomB).toString(16).slice(1)}`;
    dataColors.push({ label: label, color: i });
    return i;
  }

  function countVotes(results) {
    if (!results || !results.results || !Array.isArray(results.results)) {
      return [];
    }
  
    const counts = {};
  
    results.results.forEach((result) => {
      const label = result.DATA;

     

      if (label) {
        counts[label] = (counts[label] || 0) + 1;
      }
    });
  
    

    const sortedCounts = Object.entries(counts)
      .sort(([, countA], [, countB]) => countB - countA)
      .reduce((acc, [label, count]) => ({ ...acc, [label]: count }), {});

      const sortedUniqueResults = Object.entries(uniqueResults)
      .sort(([, countA], [, countB]) => countB - countA)
      .reduce((acc, [label, count]) => ({ ...acc, [label]: count }), {});
  
      

    const formattedData = Object.entries(sortedCounts).map(([label, count], index) => (
      
      {
      value: count,
      label: (index + 1).toString(), 
      spacing: 15,
      labelWidth: 10,
      labelTextStyle: { color: 'gray' },
      frontColor: getRandomColor(label),
    }));
  
    return formattedData;
  }


  const barData = countVotes(results);
  

  const categories = results.results.map((result) => result.CATEGORY);

  const maxCategoriesToDisplay = 5;
  const displayedCategories = categories.slice(0, maxCategoriesToDisplay);

  function getColor(labelToFind) {
  console.log(dataColors);
  const foundItem = dataColors.find(item => item.label === labelToFind);
  if (foundItem) {
    const color = foundItem.color;
    return color;
  } else {
    console.log(`Label '${labelToFind}' not found.`);
  }
 
  }


      const renderTitle = () => {
        return(
           <View style={{marginVertical: 5}}>
           <View
             style={{
               marginTop: 10,
             }}>
            
            <ScrollView horizontal>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
              {uniqueResults.map((result) => (
                <View key={result} style={{ flexDirection: 'column', alignItems: 'center', marginRight: 16 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: getColor(result), marginBottom: 8 }} />
                  <Text style={{ height: 16, color: 'lightgray' }}>{result}</Text>
                </View>
              ))}
            </View>
          </ScrollView>


             </View>
             
            
          
         </View>
         )
     }

     return (
      <View
        style={{
          backgroundColor: '#fff',
          paddingBottom: 40,
          borderRadius: 10,
        }}>
        {renderTitle()}
    
        
    <BarChart
      width={screenWidth}
      barWidth={20}
      initialSpacing={20}
    
      barPercentage={50}
      roundedTop
      roundedBottom
      hideRules
      autoShiftLabels
      
      thickness={2}
               
      maxValue={barData.length > 1 ? barData.length / 1 : barData.length * 2}
      noOfSections={barData.length / 2}
      animateOnDataChange
      animationDuration={1000}
      onDataChangeAnimationDuration={300}
      areaChart
      hideDataPoints
      startOpacity={0.4}
      endOpacity={0.1}
  
      yAxisColor="lightgray"
      xAxisColor="lightgray"
      yAxisLabelSuffix={" Votes"}
      xAxisThickness={0}
      yAxisThickness={0}
      
      labelComponent={{width: 1000}}
      yAxisLabelWidth={60}
      yAxisTextStyle={{ color: 'gray' }}
     
   
      data={barData}
      isAnimated
    />
      </View>
    );
  }

export default StatsChart;
