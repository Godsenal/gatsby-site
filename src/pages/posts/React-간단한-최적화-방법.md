---
title: React - 간과하기 쉬운 간단한 최적화 방법
date: "2019-03-23"
tags:
  - react
categories:
  - dev
---

React에서 쉽게 넘어갈 수 있는 최적화 방법 중의 하나를 작성해보려고 한다.
아주 간단한 차이가 큰 변화를 만드는 것 중 하나이다. 다음 코드를 보자.

```jsx
const Inner = () => {
  const expensiveCalc = () => {
    console.log("do expensive calculation...");
  };
  const value = expensiveCalc();
  return <div>{value}</div>;
};
const Wrapper = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(prev => prev + 1)}>+</button>
      <Inner />
    </div>
  );
};

const App = () => {
  return <Wrapper />;
};
```

별로 이상한게 없어보인다. 실행시켜보면, 버튼을 누를 때마다 `state`의 업데이트가 발생하므로 하위 컴포넌트들이 리랜더링 되고, 그에 따라 `expensiveCalc`가 실행되는 것을 볼 수 있다. 이를 막는 방법으로 `React.memo`를 사용하는 방법을 떠올릴 수 있다. 하지만, 더 간단한 방법이 있다.

```jsx
const Inner = () => {
  const expensiveCalc = () => {
    console.log("do expensive calculation...");
  };
  const value = expensiveCalc();
  return <div>{value}</div>;
};
const Wrapper = ({ children }) => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(prev => prev + 1)}>+</button>
      {children}
    </div>
  );
};

const App = () => {
  return (
    <Wrapper>
      <Inner />
    </Wrapper>
  );
};
```

코드를 이렇게 짜면 버튼을 눌러도 `expensiveCalc`가 실행되지 않는다. 즉, `Inner`가 리랜더링 되지 않는다. **props는 불변하고 children도 props 중 하나이다.** 그렇기 때문에 당연한 결과이다. `React.createElement`를 실행한 결과를 props로 주기 때문에 리랜더링은 일어나지 않는다.

애초에 `Inner` 컴포넌트가 `Wrapper`의 동작과 아무 관계가 없기 때문에 이렇게 짜는게 바람직하지만 코드를 짜다보면 그러한 로직이 한 번에 안보이는 경우가 많다! 이런 것에 주의하면 `memo`나 `shouldComponentUpdate` 같은 함수 없이 조금 더 최적화된 코드를 짤 수 있다.
