---
title: Redux의 connect. 최상위 컴포넌트에만? 여러 컴포넌트에?
date: "2018-02-03"
categories:
  - development
tags:
  - redux
banner: /images/post_02/redux.png 
---

**react에서 redux**를 사용하면서 궁금했던 것들이 많았다. 혼자 공부하다 보니 어떻게 써야할지 모르겠는 것들이 많았는데, 그 중에 하나가 `connect`를 얼마나 자주, 어느 컴포넌트에 사용해야 하는지이다. 

예전 [redux 문서](https://redux.js.org/)에는 최대한 적게 **최상위 컴포넌트**에만 사용하라고 하였다. 얼마 전은 아니고 이전에 궁금해서 이에 대해 찾아봤는데 바뀐 부분이 있었다. 조금 늦었지만 알게 된 것을 글로 남기는게 좋을 것 같아서 적어본다.

<!--more-->



먼저 본론으로 들어가기전에 redux에서 권장하는 react 패턴인 Presentational 컴포넌트와 Container 컴포넌트를 알고가면 좋다.

## Presentational 컴포넌트와 Container 컴포넌트

react 설계 구조 같은건데, 

|               | **Presentational 컴포넌트** | **Container 컴포넌트**                |
| ------------- | ----------------------- | --------------------------------- |
| **목적**        | 모양 (markup, styles)     | 작동 (data fetching, state updates) |
| **Redux와 연결** | 아니오                     | 예                                 |
| **데이터 읽기**    | props로 부터 데이터 읽음        | Redux state를 구독                   |
| **데이터 변경**    | props로 callback 호출      | Redux actions을 dispatch           |

이런식으로 나눠서 작성하는 것이다. 자세한 내용은 [이 글](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) 을 읽어보자.

아마 이런 글을 읽지 않고도 이렇게 나눠서 쓰고 있었을 지도 모른다. 나도 이렇게 쓰고 있었지만, 최소한의 최상위 container 컴포넌트에만 connect 시켜주었다. 이것이 이전 redux 문서에서 권장하는 방법이였다.

위에 말했듯이 궁금해서 찾아보았는데... 제일 처음 찾은건 관련된 github issue를 였고, 업데이트된 redux 문서까지 이르게 되어서 어떻게 해야할지 알게 되었다.

## 그래서 connect는 어디에?

Container 컴포넌트와 redux를 연결시키는 것은 기존과 변함이 없다. 다만, 기존에 말했듯이 최소한의 컴포넌트만 만들어 연결시키는 것이 아니라 필요할 때 conatiner를 만들어서 연결시켜주면 된다.

이러한 절차를 거쳐서 만들자.

1. 하나의 container와 여러 components들로 구성
2. 이러한 구성의 tree가 너무 커질 때, middle component가 너무 많은 props를 전달하게 됨.
3. 이 때, 비슷한 props를 받는 components를 새로운 container를 만들어서 감싸줌. 이렇게 함으로써 2번의 문제가 사라짐.
4. 이 과정을 반복.

사실 connect된 컴포넌트가 많을 수록 성능도 좋다고 한다. 하지만, 모든 컴포넌트에 connect를 하는 것은 보기에도 지저분하고, 데이터 흐름도 알기 힘들고 그에 따라 테스트 하기도 힘들어 질 것이다.

한 parent 컴포넌트에서 비슷한 종류의 컴포넌트에 props를 전달하여 코드가 중복되는 것 같을 때 container로 그 컴포넌트 들을 감싸주면 되는 것이다. 즉, 필요에따라 container 컴포넌트를 만들어 connect 시켜주자.
