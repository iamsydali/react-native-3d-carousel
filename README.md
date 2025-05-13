# React Native 3D Carousel

A beautiful 3D cube carousel component for React Native (Like used in instagram stories).

## Demo

![Horizontal Demo](https://github.com/iamsydali/iamsydali-public/blob/master/3d-crousel-demo-horizontal.gif) ![Vertical Demo](https://github.com/iamsydali/iamsydali-public/blob/master/3d-crousel-demo-vertical.gif)

## Installation

```bash
npm install react-native-3d-carousel
# or
yarn add react-native-3d-carousel
```

## Usage

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Carousel3D from 'react-native-3d-carousel';

const App = () => {
  const items = [
    <View style={styles.item}><Text>Item 1</Text></View>,
    <View style={styles.item}><Text>Item 2</Text></View>,
    <View style={styles.item}><Text>Item 3</Text></View>,
  ];

  return (
    <View style={styles.container}>
      <Carousel3D
        loop={true}
        scrollDirection="horizontal"
        callBackAfterSwipe={({ direction, index }) => {
          console.log(`Swiped ${direction} to index ${index}`);
        }}
      >
        {items}
      </Carousel3D>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    width: 300,
    height: 400,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default App;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | The items to display in the carousel |
| loop | boolean | false | Whether the carousel should loop |
| customHeight | number | screen height * 0.8 | Custom height for the carousel |
| customWidth | number | screen width | Custom width for the carousel |
| scrollDirection | 'horizontal' \| 'vertical' \| 'all' | 'horizontal' | Direction of scrolling |
| callBackAfterSwipe | ({ direction: string, index: number }) => void | undefined | Callback function after swipe |

## License

MIT 