---
title: Javascript에서의 동시성과 Event loop
date: "2018-07-17"
categories:
  - dev
tags:
  - javascript
---

자바스크립트는 단일 쓰레드 기반의 언어이다. 이 말은, 한번에 한 작업씩 실행할 수 있다는 말이고, 동시성을 지원하지 않는 것 처럼 보인다. 하지만 실제로 자바스크립트가 사용된 곳들을 보면, 웹 서버에 요청을 처리하는 도중에도 페이지의 랜더링 동작이 멈추지 않는다. 이를 가능하게 하는 것이 **비동기 콜백**이다. HTTP요청을 보내고 응답을 받을 때까지 다른 동작들이 멈추지 않는다. 단일 쓰레드 기반에서 이러한 작업들이 어떻게 가능한지 알아보기 위해서는 먼저 자바스크립트가 어떻게 동작하는지 알아볼 필요가 있다.

## **자바스크립트 엔진**

아마 가장 유명한 자바스크립트 엔진은 Chorme과 Node.js등에 쓰이고 있는 Google의 V8 engine 일 것이다.

자바스크립트 엔진은 두 가지 주요 구성요소가 있다.

- Call Stack
- Heap

## Heap

변수나 객체에 대한 모든 메모리 할당이 발생하는 곳이다.

## Call Stack

말 그대로 호출들을 스택 구조로 모아놓은 것이다. 여기서 호출은 함수 호출이 되겠다. 우리가 함수를 실행시키기 위해 호출할 때 Call stack 맨 위에 push하고, 함수에서 return 될 때 pop된다.

```js
function foo(x, y) {
  return x * y;
}
function bar(x) {
  var multiple = foo(x, x);
  console.log(multiple);
}

bar(5);
```

이러한 코드가 있을 때 Call Stack을 보면,

![img](https://d2mxuefqeaa7sj.cloudfront.net/s_50722767004B6B978519EFCAC1DC1BB49515C24C4A99A756EAE77665267F6F27_1529896613288_.PNG)

이런식으로 동작한다. Call Stack안에 각 항목들은 **Stack Frame**이라고 부른다. 대게 이러한 동작들은 ms안에 끝난다.

Call Stack에는 정해진 Frame 수가 있으며 이 수를 넘을 경우, **Maximum call stack size exceeded** 에러가 뜬다. 예를 들어, 이런 경우다.

```js
function foo() {
  return foo();
}
foo();
```

![img](https://d2mxuefqeaa7sj.cloudfront.net/s_50722767004B6B978519EFCAC1DC1BB49515C24C4A99A756EAE77665267F6F27_1529896984363_image.png)

## 동시성과 Event Loop

자바스크립트가 단일 쓰레드라는 말은 위에서 설명한 Call Stack이 하나 뿐 이라는 것이다. 만약에, 시간을 아주 많이 소비하는 작업이 Call Stack에 들어가면 어떻게 될까?

for나 while 같은 반복문이 몇 백만개의 loop를 돈다면, Call Stack을 계속 차지하게 된다. 이러한 것을 **blocking script**라고 하며, 웹페이지의 스피드를 체크하는 곳에서 자주 볼 수 있다. 복잡한 이미지를 처리하는 작업등도 마찬가지이다.

브라우저는 그 작업이 무언가를 return하기 전까지는 아무것도 할 수 없게 되고 막힐 것이다. 즉, 동시성을 기대할 수 없게된다.

다행히 우리에겐 **비동기 콜백**이 있다.

비동기 콜백으로 함수를 넘겨주면, 비동기 작업(setTimeout, AJAX …)이 끝난 후 함수를 실행한다. 그 작업들은 Web API들로서, 자바스크립트 엔진과 관련이 없다.

브라우저는 Web API 작업들이 들어오면 새로운 쓰레드를 만들고, 그 쓰레드에서 관리를 한다. 그 후 부터 자바스크립트는 그 작업에 대해 전혀 관련이 없다.

비동기 작업들이 끝나면, Callback을 처리해야 한다. 여기서 **Event Queue** 와 **Event Loop**가 등장한다. 어떤 비동기작업이든 끝나면, callback을 **Event Queue**에 넣어준다. **Event Loop**는 Event Queue와 Call Stack을 보며 Call Stack이 비어 있을 때, Event Queue에 들어있는 첫 번째 작업을 넣어준다.

즉, 이러한 방식으로 동작한다.

```js
while (queue.waitForMessage()) {
  queue.processNextMessage();
}
```

queue.waitForMessage 함수는 현재 아무 메시지(callback)가 Event Queue가 없을 경우, 그 도착을 기다리는 것이고, queue.processNextMessage 는 Call Stack이 비어있을 경우 메시지를 넣어준다.
