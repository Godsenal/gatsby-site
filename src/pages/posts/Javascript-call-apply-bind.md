---
title: "Javascript - call(), apply(), bind()"
date: "2018-07-17"
categories:
  - dev
tags:
  - javascript
---

javascript에서 함수의 prototype 메소드 call(), apply(), bind()를 알아보자

<!--more-->

## 사용법

먼저 call() /apply() 는 함수를 곧바로 호출한다. bind()는 사용법이 약간 다른 메소드로 나중에 호출하기 위한 함수를 반환해준다.

들어가기 전에 먼저 이 코드를 보자

```js
let bark = function(a, b) {
  return `${this.color} dog barks at ${a} at ${b}`;
};

console.log(bark("me", "home"));
```

어떤 결과 값이 나올까?

함수 내부에서 this는 함수를 호출한 방법에 의해 결정된다. 위에서는 bark()라는 함수가 객체의 메소드나 속성으로서 호출된 것이 아니라 직접 호출되었기 때문에 this는 전역객체를 가리킬 것이고 전역객체에 color 속성을 따로 명시해주지 않았기 때문에 undefined가 나올 것이다.

이럴 때, 함수안에서 this에 어떤 객체를 바인딩시켜주고 싶다면 어떻게 할까?

## call()

먼저 코드를 보면

```js
let dog = { color: "white" };

//this에 dog이 할당됨.
let bark = function(a, b) {
  return `${this.color} dog barks at ${a} at ${b}`;
};

console.log(bark.call(dog, "me", "home"));
// 'white dog barks at me at home.'
```

call()의 첫 번째 인자는 함수내 context에서 사용될 this의 값을 지정해준다. 위에서는 dog 객체가 지정되었다. 나머지 인자들은 실제 함수에 적용될 인자 값을 넣어준다. 이 때, this를 나타내는 값이 객체가 아니라면 연관된 생성자를 사용하여 객체로 변환한다. 예를들어, 숫자 7을 넣어줬다면, new Number(7) 을 사용하며 변환된 객체를 넣어준다.

## apply()

apply()는 call() 과 하는 일이 똑같다. 다만, apply()는 함수의 인자를 배열로서 넘겨주게 된다.

```js
let dog = { color: "white" };

//this에 dog이 할당됨.
let bark = function(a, b) {
  return `${this.color} dog barks at ${a} at ${b}`;
};

let args = ["me", "home"];
console.log(bark.apply(dog, args));
// 'white dog barks at me at home.'
```

위 코드는 처음 코드와 똑같다. 다만, 함수의 인자를 args라는 배열로 넘겨줬을 뿐이다.

## bind()

bind()는 위 두 메소드와는 다르다. bind()는 새로운 함수를 반환시켜 주는데, 이 함수는 인자로 받은 객체를 this로 설정하는 새로운 함수를 생성해준다.

```js
let dog = { color: 'white' };

let bark = function(a, b) {
  return `${this.color} dog barks at ${a} at ${b}`;
}

let bindingBark = bark.bind(dog);

console.log(bindingBark('me', 'home');
// 'white dog barks at me at home.'
```

이 코드를 보면 따로 call()이나 apply() 없이 this에 dog이 바인딩 된 것을 볼 수 있다. bind()에 나머지 인자들은 실제 함수의 인자들을 call()처럼 넣어줄 수 있다.
