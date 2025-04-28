import React, { useRef, useEffect } from 'react';
import {
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  PanResponderGestureState,
} from 'react-native';

type ScrollDirection = 'horizontal' | 'vertical' | 'all';

interface Props {
  children: any;
  loop?: boolean;
  customHeight?: number;
  customWidth?: number;
  scrollDirection?: ScrollDirection;
  callBackAfterSwipe?: ({
    direction,
    index,
  }: {
    direction: string;
    index: number;
  }) => void;
}

const {width: screenW, height: screenH} = Dimensions.get('window');
const defaultHeight = screenH * 0.8;
const defaultWidth = screenW;

const PERSPECTIVE = Platform.OS === 'ios' ? 2.38 : 1.95;
const TR_POSITION = Platform.OS === 'ios' ? 2 : 1.5;

const Carousel3D = (props: Props) => {
  const { children, customHeight, customWidth, loop, scrollDirection = 'horizontal', callBackAfterSwipe } = props;
  
  const isVerticalSwipe = useRef(false);
  
  const height = customHeight || defaultHeight;
  const width = customWidth || defaultWidth;
  
  const pagesX = children.map((_child: any, index: number) => width * -index);
  const pagesY = children.map((_child: any, index: number) => height * -index);
  const fullWidth = (children.length - 1) * width;
  
  const animatedValue = useRef(new Animated.ValueXY()).current;
  const value = useRef({ x: 0, y: 0 }).current;
  const lastValue = useRef({ x: 0, y: 0 }).current;
  
  const currentIndex = useRef(0);
  
  useEffect(() => {
    animatedValue.setValue({x: 0, y: 0});
    
    const listener = animatedValue.addListener((val: {x: number, y: number}) => {
      value.x = val.x;
      value.y = val.y;
    });
    
    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue]);

  const onDoneSwiping = (gestureState: PanResponderGestureState) => {
    let goTo = currentIndex.current;
    let swipeDirection = 'none';
    
    if (isVerticalSwipe.current) {
      // Limit to one item at a time for vertical swipe
      if (gestureState.dy > 50) {
        // Swipe down (previous item)
        goTo = Math.max(0, currentIndex.current - 1);
        swipeDirection = 'down';
      } else if (gestureState.dy < -50) {
        // Swipe up (next item)
        goTo = Math.min(children.length - 1, currentIndex.current + 1);
        swipeDirection = 'up';
      }
      
      // Apply looping if enabled
      if (loop && children.length > 1) {
        if (currentIndex.current === 0 && gestureState.dy > 50) {
          goTo = children.length - 1;
        } else if (currentIndex.current === children.length - 1 && gestureState.dy < -50) {
          goTo = 0;
        }
      }
      
      const newValue = {
        x: pagesX[goTo],
        y: pagesY[goTo],
      };
      
      lastValue.x = newValue.x;
      lastValue.y = newValue.y;
      
      animatedValue.flattenOffset();
      Animated.spring(animatedValue, {
        toValue: {x: 0, y: pagesY[goTo]},
        friction: 3,
        tension: 0.6,
        useNativeDriver: false,
      }).start();
    } else {
      // Limit to one item at a time for horizontal swipe
      if (gestureState.dx > 50) {
        // Swipe right (previous item)
        goTo = Math.max(0, currentIndex.current - 1);
        swipeDirection = 'right';
      } else if (gestureState.dx < -50) {
        // Swipe left (next item)
        goTo = Math.min(children.length - 1, currentIndex.current + 1);
        swipeDirection = 'left';
      }
      
      // Apply looping if enabled
      if (loop && children.length > 1) {
        if (currentIndex.current === 0 && gestureState.dx > 50) {
          goTo = children.length - 1;
        } else if (currentIndex.current === children.length - 1 && gestureState.dx < -50) {
          goTo = 0;
        }
      }
      
      const newValue = {
        x: pagesX[goTo],
        y: pagesY[goTo],
      };
      
      lastValue.x = newValue.x;
      lastValue.y = newValue.y;
      
      animatedValue.flattenOffset();
      Animated.spring(animatedValue, {
        toValue: {x: pagesX[goTo], y: 0},
        friction: 3,
        tension: 0.6,
        useNativeDriver: false,
      }).start();
    }
    
    // Update current index
    currentIndex.current = goTo;
    
    if (callBackAfterSwipe) {
      callBackAfterSwipe({
        direction: swipeDirection,
        index: goTo,
      });
    }
  };
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        animatedValue.stopAnimation();
        animatedValue.setOffset({
          x: lastValue.x,
          y: lastValue.y,
        });
      },
      onPanResponderMove: (e, gestureState) => {
        const {dx, dy} = gestureState;

        // Determine if the gesture is vertical or horizontal based on scrollDirection
        if (scrollDirection === 'vertical') {
          isVerticalSwipe.current = true;
        } else if (scrollDirection === 'horizontal') {
          isVerticalSwipe.current = false;
        } else {
          // For 'all', determine based on gesture
          isVerticalSwipe.current = Math.abs(dy) > Math.abs(dx);
        }

        // Only allow movement in the allowed direction
        if (scrollDirection === 'vertical' || (scrollDirection === 'all' && isVerticalSwipe.current)) {
          Animated.event(
            [null, {dy: animatedValue.y, dx: animatedValue.x}],
            {
              listener: () => {},
              useNativeDriver: false,
            },
          )(e, gestureState);
        } else if (scrollDirection === 'horizontal' || (scrollDirection === 'all' && !isVerticalSwipe.current)) {
          Animated.event(
            [null, {dy: animatedValue.y, dx: animatedValue.x}],
            {
              listener: () => {},
              useNativeDriver: false,
            },
          )(e, gestureState);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        onDoneSwiping(gestureState);
      },
    })
  ).current;

  const getTransformsFor = (i: number) => {
    const scrollX = animatedValue.x;
    const scrollY = animatedValue.y;

    const pageX = -width * i;
    const pageY = -height * i;

    const loopVariable = (variable: number, sign = 1) =>
      variable + Math.sign(sign) * (fullWidth + width);

    const padInput = (variables: number[]): number[] => {
      if (!loop) {
        return variables;
      }
      const returnedVariables = [...variables];
      returnedVariables.unshift(
        ...variables.map((variable: number) => loopVariable(variable, -1)),
      );
      returnedVariables.push(
        ...variables.map((variable: number) => loopVariable(variable, 1)),
      );
      return returnedVariables;
    };

    const padOutputNum = (variables: number[]): number[] => {
      if (!loop) {
        return variables;
      }
      const returnedVariables = [...variables];
      returnedVariables.unshift(...variables);
      returnedVariables.push(...variables);
      return returnedVariables;
    };
    
    const padOutputStr = (variables: string[]): string[] => {
      if (!loop) {
        return variables;
      }
      const returnedVariables = [...variables];
      returnedVariables.unshift(...variables);
      returnedVariables.push(...variables);
      return returnedVariables;
    };

    const translateX = scrollX.interpolate({
      inputRange: padInput([pageX - width, pageX + width]),
      outputRange: padOutputNum([
        -width / TR_POSITION,
        width / TR_POSITION,
      ]),
      extrapolate: 'clamp',
    });

    const translateY = scrollY.interpolate({
      inputRange: [pageY - height, pageY, pageY + height],
      outputRange: [-height / TR_POSITION, 0, height / TR_POSITION],
      extrapolate: 'clamp',
    });

    const rotateY = scrollX.interpolate({
      inputRange: padInput([pageX - width, pageX, pageX + width]),
      outputRange: padOutputStr(['-60deg', '0deg', '60deg']),
      extrapolate: 'clamp',
    });

    const rotateX = scrollY.interpolate({
      inputRange: [pageY - height, pageY, pageY + height],
      outputRange: ['60deg', '0deg', '-60deg'],
      extrapolate: 'clamp',
    });

    const translateXAfterRotate = scrollX.interpolate({
      inputRange: padInput([
        pageX - width,
        pageX - width + 0.1,
        pageX,
        pageX + width - 0.1,
        pageX + width,
      ]),
      outputRange: padOutputNum([
        -width - 1,
        (-width - 1) / PERSPECTIVE,
        0,
        (width + 1) / PERSPECTIVE,
        +width + 1,
      ]),
      extrapolate: 'clamp',
    });

    const translateYAfterRotate = scrollY.interpolate({
      inputRange: [
        pageY - height,
        pageY - height + 0.1,
        pageY,
        pageY + height - 0.1,
        pageY + height,
      ],
      outputRange: [
        -height - 1,
        (-height - 1) / PERSPECTIVE,
        0,
        (height + 1) / PERSPECTIVE,
        +height + 1,
      ],
      extrapolate: 'clamp',
    });

    const opacityX = scrollX.interpolate({
      inputRange: padInput([
        pageX - width,
        pageX - width + 10,
        pageX,
        pageX + width - 250,
        pageX + width,
      ]),
      outputRange: padOutputNum([0, 0.6, 1, 0.6, 0]),
      extrapolate: 'clamp',
    });

    const opacityY = scrollY.interpolate({
      inputRange: [
        pageY - height,
        pageY - height + 30,
        pageY,
        pageY + height - 100,
        pageY + height,
      ],
      outputRange: [0, 0.6, 1, 0.6, 0],
      extrapolate: 'clamp',
    });

    return isVerticalSwipe.current
      ? {
          transform: [
            {perspective: height},
            {translateY},
            {rotateX: rotateX},
            {translateY: translateYAfterRotate},
          ],
          opacity: opacityY,
        }
      : {
          transform: [
            {perspective: width},
            {translateX},
            {rotateY: rotateY},
            {translateX: translateXAfterRotate},
          ],
          opacity: opacityX,
        };
  };

  const renderChild = (
    child: React.FunctionComponentElement<{i: any; style: any[]}>,
    i: number,
  ) => {
    const expandStyle = {width, height};
    const style = [child.props.style, expandStyle];
    const props = {
      i,
      style,
    };
    const element = React.cloneElement(child, props);

    return (
      <Animated.View
        style={[StyleSheet.absoluteFill, getTransformsFor(i)]}
        key={`child-${i}`}>
        {element}
      </Animated.View>
    );
  };

  const expandStyle = {width, height};

  return (
    <Animated.View style={styles.main} {...panResponder.panHandlers}>
      <Animated.View style={[styles.container, expandStyle]}>
        {children.map(renderChild)}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  main: {position: 'absolute'},
  container: {backgroundColor: '#000', position: 'absolute'},
});

export default Carousel3D;
