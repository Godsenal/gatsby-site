---
title: debounce와 throttle
date: '2019-07-23'
tags:
  - javascript
categories:
  - dev
---

개발할 때 기억안나고 헷갈리는 개념들이 참 많다. 그 중에서도 나는 유독 이 `debounce`와 `throttle`을 쓸 때마다 까먹는다. 대부분의 프로젝트에서 사용했는데 쓸 때마다 헷갈린다.. 이번에도 기억해야할 상황에서 또 생각이 안났는데 역시 기억하기에는 글로 써보는 것만큼 좋은게 없다. 글을 쓰면서 확실히 기억해보도록 하자.

# debounce와 throttle
먼저 두 방법 모두 함수의 발생 빈도를 제어하는 방법이다. 특히, DOM 이벤트 핸들러에 유용하게 사용할 수 있다. 이벤트 자체의 발생 빈도를 제어할 수는 없지만 그 이벤트의 발생에 따라 동작해야 하는 함수의 발생 빈도는 이 두 함수로 제어할 수 있다. 필요에 따라 그 수를 조절하여 성능상의 이점을 가져올 수 있다.

## debounce
먼저 `debounce`는 연속적인 호출들을 하나의 호출로 그룹화시킨다. 

<iframe width="100%" height="300" src="//jsfiddle.net/godsenal/eur2azv9/embedded/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

버튼을 처음 클릭하면 1200ms 후에 `debounce`된 함수가 호출된다. 만일, 1200ms안에 여러번 버튼이 클릭된다면 이 호출들을 하나로 그룹화하여 마지막 함수만 호출하게 된다. 즉, 마지막 버튼이 클릭되고 1200ms가 지난 후에 함수가 호출되게 된다.

내가 가장 자주 사용했던 경우는 자동완성기능이다. 자동완성을 클라이언트내에서 동기적으로 보여주는 경우에는 큰 상관없겠지만, 서버로 부터 자동완성의 결과를 받아오는 경우 `input`의 변경 이벤트마다 api를 호출하는 것은 바람직하지 않다. 예를 들어, 유저가 `강남`을 검색하려고 할 때 `ㄱ`이 타이핑되고 api호출, `가`가 타이핑 되고 호출... 이런식으로 하는 것은 큰 낭비이다.

이 때, `debounce`를 사용하면 `input`의 마지막 변경이 멈추고 지정된 시간만큼 지난 후에만 api를 호출할 수 있다.

## throttle
`throttle`은 X 시간안에 함수 호출을 딱 한번만 하도록 하는 함수이다. 

`debounce`는 이벤트가 반복되면 그 이벤트의 반복이 끝나고 X 시간후에 한번만 함수를 호출하는 반면에 `throttle`는 이벤트가 반복되어도 매 X 시간마다 함수를 호출한다는 차이가 있다.

`throttle`은 보통 **infinite scroll**을 구현할 때 많이 사용된다. **infinite scroll** 구현 시 유저가 바닥근처까지 스크롤을 했을 때 다음 컨텐츠가 추가로 로드되어야 하는데, `debounce`를 사용할 경우 스크롤을 멈추지 않으면 이벤트가 발생하지 않는다. 이 때, `throttle`을 유용하게 사용할 수 있다.

<iframe width="100%" height="300" src="//jsfiddle.net/godsenal/8j35zgL4/20/embedded/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

이 예제를 스크롤 해보면 확실하게 차이를 알 수 있다.

## 결론

`debounce`와 `throttle`는 어디서든 유용하게 사용될 수 있으니 각자의 차이를 확실하게 인지하자. 글을 정리하며 확실히 머릿속에 박힌 것 같다. 다음번에 사용할 때는 헷갈릴 일이 없길바란다.