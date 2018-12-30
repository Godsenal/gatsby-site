---
title: React - PureComponent 제대로 사용하기
date: "2018-11-05"
categories:
  - dev
tags:
  - react
---

React에서 제공하는 컴포넌트 클래스는 기본 Component와 `PureComponent`가 있다. (함수형 컴포넌트일 경우에는 16.6 버전에 나온 React.memo 가 PureComponent 역할을 한다.) 기본 Component와 PureComponent의 차이는 단순히 성능적인 차이로, PureComponent는 [shouldComponentUpdate](https://reactjs.org/docs/react-component.html#shouldcomponentupdate) 를 통해 props와 state의 얕은 비교를 하여 불필요한 re-render를 막아준다. 얼핏보면 모든 컴포넌트 클래스가 PureComponent를 확장하여 사용하는게 좋아보이지만, 잘못사용하면 오히려 성능 감소를 일으킬 수 있다. 왜 그런지, 어떻게 사용해야하는지 알아보자.

<!--more-->

## React의 re-render 방식

그 차이를 알아보기 위해서는 먼저 react의 re-render방식을 알아볼 필요가 있다. React의 가장 기본적은 re-render 트리거는 `setState`다. setState가 일어나면 그 컴포넌트와 그 컴포넌트 아래에 있는 모든 컴포넌트의 `render()`를 호출하여 기존 엘리먼트 트리(virtual DOM)와 비교를 하고, 그 정보를 이용해 실제 돔 엘리먼트를 업데이트한다. 여기서 중요한 점은 비교한다는 점이다.

```jsx
import React from "react";
import ReactDOM from "react-dom";

class Message extends React.Component {
  render() {
    const { message } = this.props;
    return <div>{message}</div>;
  }
}
class App extends React.Component {
  state = {
    input: "",
    messages: []
  };
  handleChange = e => {
    this.setState({
      input: e.target.value
    });
  };
  addMessage = () => {
    this.setState(state => ({
      input: "",
      messages: [...state.messages, state.input]
    }));
  };
  render() {
    const { input, messages } = this.state;
    return (
      <div>
        <div>
          <input value={input} onChange={this.handleChange} />
          <button onClick={this.addMessage}>Add</button>
        </div>
        {messages.map((message, i) => (
          <Message key={i} message={message} />
        ))}
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

실제 re-render가 어떻게 일어나는지 확인하기 위해 이러한 코드를 짜보자. 그리고 [react-developer-tool](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) 의 Highlight Updates 옵션을 켜보자.(Message 컴포넌트의 render안에 console을 찍어봐도 된다.)

![rerender](/images/post_purecomponent/rerender.gif)

input의 값이 바뀔 때, 이미 render되어 있는 다른 메시지 컴포넌트도 re-render 되는 것을 볼 수 있다. 앞에서 말했듯이, `<App>` 의 `handleChange` 메소드에서 setState가 실행되고, 이는 하위 컴포넌트인 `Message`의 re-render를 가져온다. 이는 전혀 불필요한 동작으로 성능을 감소시키는 요소가 된다.

## ShouldComponentUpdate와 PureComponent

위 예제에서, Message 컴포넌트가 `React.PureComponent`를 확장하도록 바꿔보자. 그리고 다시 테스트해보면 확실하게 달라진 것을 볼 수 있다.

React.PureComponent는 `shouldComponentUpdate`(이하 scu)가 도입되어 있다는 점에서 React.Component와 차이가 있다. scu는 react의 컴포넌트를 re-render할지 안할지를 결정해주는 api로서, 위에서 말한 성능향상에 목적이 있다. 이 함수가 없거나, return 값이 true일 경우 re-render를 진행하고, false일 경우 하지 않는다.

PureComponent는 scu가 도입되어 있고, 이 scu안에서는 현재 state, props를 다음에 받을 state, props와 얕은 비교를 해준다. 비교값이 참일 경우 즉, **현재와 다음의 state, props가 같은 경우에는 false를 반환하여 re-render를 진행하지 않고, 반대의 경우 true를 반환해준다.**

위 예제에 도입해보자. App 컴포넌트의 state가 바뀔 때 마다 Message 컴포넌트의 업데이트가 진행되고, render 하기전 scu를 호출한다. Message 컴포넌트의 state는 존재하지 않고, props인 `message`의 값은 변하지 않았으므로 false를 반환하여 re-render를 진행하지 않는다. 간단하게 성능을 향상시킬 수 있는 방법이다!

## PureComponent 사용시 주의해야 할 점

하지만, 무조건 써야할 것 같은 PureComponent도 사용시 주의해야 할 점이 있다. 만일, state나 props가 항상 바뀌는 컴포넌트에 PureComponent를 도입하면 어떤일이 일어날까? 예를 들어, props가 인라인 함수일 경우, 매 render마다 props는 바뀌게 되어 PureComponent안에 scu는 항상 true를 반환한다.

이런 경우, 오히려 매번 비교를 두 번씩 해주는 셈이다. scu안에서 props와 state를 비교해주고, 어차피 true가 반환되어 render()가 호출되고, 새 엘리먼트와 기존 엘리먼트도 비교하게 된다. 이는 당연히 성능 감소를 가져온다.
