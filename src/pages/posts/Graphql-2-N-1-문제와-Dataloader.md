---
title: Graphql 2 - N+1 문제와 Dataloader
date: "2018-10-22"
categories:
  - dev
tags:
  - graphql
banner: /images/post_06/graphql.png
---

Graphql에는 REST에서는 나타나지 않는 몇 가지 문제가 있다. 그 중에 하나가 **N+1문제**이다. 이 글에서는 N+1문제와 이를 해결할 수 있는 `Dataloader` 에 대해서 알아본다.

<!--more-->

## N+1 문제

먼저, N+1 문제에 대해 알아보자. N+1 문제는 성능에 관한 문제 중 하나로 주로 관계형 데이터베이스에서 **one-to-many** 관계를 가진 테이블 일어나는 문제이다.

데이터베이스에 **Author** 테이블과 **Post** 테이블이 있다고 하자. 한 Author는 여러개의 Post를 가지고 있을 수 있으므로, one-to-many 관계를 형성한다. 이 때, 모든 Author의 모든 Post를 가져오고자 한다면,

```sql
SELECT * FROM Author;
```

먼저, 모든 Author를 가져온 후, **n개의** author에 대해서 post를 가져올 수 있다.

```sql
SELECT * FROM Post Where author_id = ?
```

n개의 Author들을 가져오는 쿼리 1번, n명의 author에 대한 post를 가져오는 쿼리가 n 번. 즉, 쿼리가 N+1번 만큼 실행된다. 이것이 N+1 문제로, 당연히 여러 문제를 가져온다. N개의 결과를 가져오는 쿼리를 한 번 날리는 것이 더 좋고 이는 데이터베이스서버가 따로 떨어져 있을 때 큰 성능저하를 가져올 것이다.

하지만, 이렇게 작성하는 사람은 별로 없을 것이다. `where ~ in`을 사용하거나, `join`을 사용하여 하나의 쿼리로 해결할 수 있다. 그러면 이게 왜 문제가 되는 것일까? 그것은 Graphql의 특성에 있다.

## Graphql에서의 N+1 문제

위와 같은 결과를 얻는 Graphql을 생각해보자.

```
authors {
    ...
    posts {
        ...
    }
}
```

내부적으로 authors 쿼리는 모든 authors를 데이터베이스에서 가져오고, author의 post필드는 author의 id를 받아 post를 가져오는 쿼리가 될 것이다. 결국 위에서 말한 N+1문제가 일어나게 된다. n명의 author를 받아오고 post를 가져오는 n번의 쿼리를 실행하게 된다. 이를 해결해 줄 수 있는 것이 `Dataloader`이다.

## Dataloader

Dataloader는 Graphql에 자주 쓰이지만, 다른 상황에도 쓰일 수 있다. 기본 개념은 데이터베이스에 대한 요청을 Batching과 Caching 하는 것이다.

이 중 N+1문제를 해결해주는 것은 Batching이다. Dataloader는 같은 데이터베이스에 대한 각각의 요청을 모아서 한 번의 요청으로 보내준다. 우리는 그 한번의 요청(쿼리)만 짜놓으면 된다. 그리고 요청으로 받은 결과 값들을 각각에 요청에 맞게 보내준다.

```js
import DataLoader from 'dataloader';
const postsLoader = new DataLoader((author_ids) => getPostsByAuthorIds(author_ids));
postsLoader(1).then((posts) => console.log(posts);) // authorId 1에 해당하는 post들
postsLoader(2).then((posts) => console.log(posts);) // authorId 2에 해당하는 post들
postsLoader(3).then((posts) => console.log(posts);) // authorId 3에 해당하는 post들

// 위 작업이 한 번의 쿼리로 이루어진다.
```

위와 같이 사용할 수 있다. `getPostsByAuthorIds`에서 `where ~ in`이나 `join`과 같이 한 번의 쿼리로 n개의 결과를 가져오는 데이터베이스에 대한 요청을 해주면, N+1 문제를 해결 할 수 있다. author들을 가져오는 쿼리 안에서 각각 author에 대한 post를 가져오는 쿼리들이 dataloader를 통해 합쳐져서 하나의 쿼리로 각 author_id에 대한 posts들을 가져올 수 있다.

Dataloader는 어떻게 이런 작업을 해주는 것일까? Dataloader는 **event loop**의 특성을 이용하여 이 작업을 가능하게 한다. event loop가 한 번 실행되기 전 모든 동작을 합쳐서 한 번의 동작으로 해결해주는 것이다.

```js
import DataLoader from 'dataloader';
const postsLoader = new DataLoader((author_ids) => getPostsByAuthorIds(author_ids));
postsLoader.load(1).then((posts) => console.log(posts);) // authorId 1에 해당하는 post들
postsLoader.load(2).then((posts) => console.log(posts);) // authorId 2에 해당하는 post들
postsLoader.load(3).then((posts) => console.log(posts);) // authorId 3에 해당하는 post들

// 위 작업이 한 번의 쿼리로 이루어진다.

setTimeout(() => {
    postsLoader.load(4).then((posts) => console.log(posts);) // authorId 4에 해당하는 post들
    postsLoader.load(5).then((posts) => console.log(posts);) // authorId 5에 해당하는 post들
    postsLoader.load(6).then((posts) => console.log(posts);) // authorId 6에 해당하는 post들
}, 0);

// 위 작업은 그 다음에 이루어 진다.
```

위와 같은 예로 알 수 있다. event loop의 한 tick을 기준으로 하기 때문에, 먼저 author_id (1, 2, 3) 에 대한 요청이 한 번에 이루어지고 그 다음 (4, 5, 6)에 대한 요청이 한 번에 이루어 진다.

```js
class Dataloader {
  constructor(func) {
    this.myFunc = func; // batching 함수
    this.params = []; // 각 요청마다의 인자 (author_id)
    this.resolves = []; // 각 요청마다 반환해줄 promise의 resolver 들
    this.isBatched = false; // 현재 bacthing 중 인지를 알려주는 플래그
  }
  initialize() {
    this.params = [];
    this.resolves = [];
    this.isBatched = false;
  }
  load(param) {
    this.params.push(param);
    if (!this.isBatched) {
      process.nextTick(() => this.batchFunc());
      this.isBatched = true;
    }
    return new Promise((res, rej) => {
      this.resolves.push(res);
    });
  }
  batchFunc() {
    const result = this.myFunc.apply(null, this.params);
    this.resolves.map((res, i) => res(result[i]));
    this.initialize();
  }
}
```

Dataloader가 어떻게 동작하는지 이해하기 위해 nodejs에서 동작하는 간단한 dataloader를 만들어 보았다.

dataloader의 함수가 `load`될 때 마다 요청된 인자(위의 예에서 author_id)를 배열에 모아주고, 다음 event loop의 tick에 `batchFunc`가 실행되도록 해준다. 그리고 Promise를 반환해 주고, 이 promise를 resolver 들을 배열에 저장해 둔다. 또 다시 이 dataloader가 load되면, 이미 `batching` 중 이므로 프로미즈만 반환해준다. 이렇게 한 event tick 동안에 모든 요청들을 모아두고, 다음 event loop 때 `batchFunc`가 실행된다.

batchFunc에서는 dataloader를 생성했을 때 넣어준 `getPostsByAuthorIds`와 같은 데이터베이스 요청을 실행시켜주고, 모아둔 Promise들을 결과 값과 함께 모두 resolve 시킨 후 다시 요청을 받을 준비를 한다.

## 주의할 점

Dataloader를 사용할 시 주의할 점이 있다. 위에 임의로 만든 dataloader의 `batchFunc` 부분을 보면, Promise를 resolve 시킬 때, 배열에 들어온 순서대로 resolve 시킨다. 이와 마찬가지로 실제 dataloader에서도 요청의 순서와 결과의 순서가 동일해야 한다. 즉,

```js
postsLoader.load(1).then((posts) => console.log(posts);) // authorId 1에 해당하는 post들
postsLoader.load(2).then((posts) => console.log(posts);) // authorId 2에 해당하는 post들
postsLoader.load(3).then((posts) => console.log(posts);) // authorId 3에 해당하는 post들
```

이런 순서로 dataloader를 실행했다면, 결과 값도 `[1에 해당하는 결과, 2에 해당하는 결과, 3에 해당하는 결과]` 가 되어야 한다는 것이다.

## 결론

Dataloader를 간단하게 알아보았다. Grapqhl을 사용한다면, 매우 간단한 요청만 있지 않는 이상 dataloader는 필수적이라고 생각한다. 또 한, 같은 요청에 대해서 Caching 도 해주기 때문에 더욱 성능을 향상 시킬 수 있다.
