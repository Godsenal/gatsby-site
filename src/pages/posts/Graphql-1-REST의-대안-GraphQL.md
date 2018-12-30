---
title: Graphql 1 - REST의 대안 GraphQL
date: "2018-10-22"
categories:
  - dev
tags:
  - graphql
banner: /images/post_06/graphql.png
---

어느땐가 부터 GraphQL이라는 이름을 여러번 듣게 되었다. REST의 효율적인 대안이될 수 있다는데 당시에는 이미 REST로 간단한 프로젝트를 진행 중이여서 관심을 가지지 못했는데, 이번에 기회가 되어 혼자 열심히 공부해보게 되었다. 스키마를 만드는 것 부터 너무 많은 방법들이 있어서 간단히 정리해보려고 한다. 처음 react를 배울때 같았다. 지금 까지 배운 내용들을 간단히 정리해보려고 한다.

<!--more-->

## 왜 사용하는가?

GraphQL은 REST의 효율적인 대안이 될 수 있는 새로운 API 기준이다. REST는 의미가 많이 확장되었지만 여기서 말하는 REST는 GET, POST, PUT, DELETE의 http 요청으로 원하는 response를 가져올 수 있도록 하는 것을 말한다. API는 클라이언트가 서버로부터 어떻게 데이터를 가져올 수 있는지에 대한 방법의 정의이다.

이미 잘 사용하고 있는 REST에 왜 대안이 필요한가 라고 말할 수 있지만, GraphQL은 REST에 대비해 다음과 같은 장점이 있다.

1. 필요한 데이터만 보냄으로서 효율적인 데이터 로드가 가능하다.
2. 다양한 클라이언트 사이드 플랫폼에 쉽게 대응할 수 있다.
3. 빠른 기능 개선

GraphQL은 REST의 대안으로서 사용가능하지만, REST의 장점도 가지고 있다.
stateless하기 때문에 이전 이후에 대한 정보 필요없이 구조적으로 자원에 접근이 가능하다.

개인적으로 가장 좋다고 생각되는 장점은 Over fetching과 Under fetching이 없이 클라이언트가 서버와 좀 더 유연하게 소통할 수 있다는 점이다.

## 기본적인 GraphQL

GraphQL은 쿼리를 이용하여 클라이언트가 원하는 데이터를 가져온다.

먼저 간단히 graphQL이 REST와 어떻게 다른지부터 알아보자.

유저의 ID를 이용하여 유저의 정보와 해당하는 유저가 작성한 글들을 가져오고 싶다고 할 때, REST라면 이런식으로 http 요청을 할 것이다.
`GET /api/users?userId=<userId>`
`GET /api/users/posts?userId=<userId>`

물론 다른 방식으로 짤 수도 있겠지만, 여러번 요청을 보내야한다는 것은 비슷할 것이다.

graphQL은 이런식으로 가능하다.

```
query {
  user(id: <userId>) {
    name
    posts {
      title
    }
  }
}
```

위와 같은 단 하나의 쿼리를 이용해 원하는 데이터를 가져올 수 있다. 또 한, 중요한 특성이 있는데 원하는 데이터만 클라이언트가 골라서 가져올 수 있다. 위 쿼리를 실행하면 우리는 user의 `name`과 `posts`만 가져올 수 있고, `posts` 중에서도 `title`만 가져올 수 있다.

위와 같은 특성이 graphQL이 클라이언트가 원하는 데이터만 가져올 수 있도록 하게 하는 것이다.

이렇게 함으로써, 클라이언트와 서버의 연결관계를 느슨하게 하고, 각각의 스케일을 독립적으로 키울 수 있게 해준다.

## GraphQL Magic

GraphQL 글을 보다보면 **Magic**이라는 표현이 자주 보인다. 위의 예제와 같은 쿼리가 정말 마법같이 작동을 한다. 한 가지 확실히 알아야 하는 것은 GraphQL은 단순히 type system을 제공해주는 query language라는 것이다. 그럼 어떻게 동작하는 것일까?

GraphQL은 자신만의 type system을 가지고 있는데, 이는 API의 스키마를 정의하는데 사용된다. 이 스키마를 정의하는데 사용되는 문법을 **Schema Definition Language(SDL)** 이라고 부른다.

우리는 User와 Post에 대해서 다음과 같이 타입을 정의할 수 있다.

```
type User {
  id: String!
  name: String!
  posts: [Post]
}
type Post {
  title: String!
  contents: String!
}
```

이 글에서는 어떻게 동작하는지만 볼 것이므로 간단히 설명하자면,

`User`라는 타입과 `Post`라는 타입이 있다.

`User`타입에는 `String` 타입의 `id`, `name` 그리고 `Post`타입의 배열 타입인 `posts`가 있다. (!는 필수적임을 의미한다.)

`Post`타입에는 `String` 타입의 `title`과 `contents`가 있다.

물론 이렇게 각 데이터들의 타입을 정의하는 것만으로는 부족하다. GraphQL에는 특별한 root type인 `Query` `Mutation` `Subscription`이 있다. 이들은 클라이언트가 request를 보냈을 때 entry point 역할을 한다.

우리는 아까 `user(id: <userId>)` 라는 쿼리를 이용하여 `User` 데이터를 가져왔다. 이는 `Query` 타입에 있는 `user(id: String)`을 이용한 것으로 다음과 같이 정의되어 있을 것이다.

```
type Query {
  user(id: String): User
}
```

즉, user라는 query는 String인 `id`를 인자로 받아, `User`타입의 데이터를 반환한다는 것이다. 그럼 db에서 데이터는 어떻게 가져올까? graphQL은 단순히 query language이며, type system을 제공해주는 **구조이다**. 실제 동작을 구현해야 graphQL이 작동할 수 있으며 이를 `resolver function`이라고 한다. graphQL의 각 field에 대해서 resolve function을 작성해줘야 한다. 예를 들어, Query 타입의 user 필드에 대해서 다음과 같이 작성해줄 수 있다.

```js
function user(parent, args, context, info) => {
  return getUserById(args.id);
}
```

모든 resolver는 4개의 인자를 받는다.

1. parent - 이전 resolver의 반환 값(첫 번째일 경우 null을 갖는다.)
2. args - query의 인자 값(여기서는 id를 받는다.)
3. context - 모든 resolver로 전달되는 object. 원하는대로 정의해줄 수 있다.
4. info - query나 mutation의 AST.

위 함수는 Query타입의 user필드의 resolver function이다. id를 인자로 받아 db로 부터 user를 찾은 후 반환해준다. 이 때, 반환해주는 타입이 `User`이고 이 타입에도 마찬가지로 resolver function이 필요하다.

```js
function id(parent, args, context, info) => {
  return parent.id;
}
function name(parent, args, context, info) => {
  return parent.name;
}
```

즉, 첫 번째 resolver 단계에서 `User`타입의 user를 찾아 반환하고, 두 번째 resolver 단계에서 `String`타입의 id와 name을 반환한다. 이런식으로 단계별로 resolver가 실행되면서, 원하는 값을 가져올 수 있게된다. 단계별로 실행되므로 parent인자로 부터 윗단계 resolver의 반환 값을 가져올 수 있게 되는 것이다.

> 사실 위 id와 name에 대한 resolver는 작성하지 않아도 된다. graphQL은 parent의 argument와 field의 이름이 같으면 반환된 값을 추론할 수 있다.

이러한 resolver를 작성하고나면 작성한 Schema에 resolver를 합쳐주면(이 글에서는 생략하도록 하겠다.) 드디어 다음과 같은 쿼리를 실행할 수 있게 된다.

```
query {
  user(id: "123") {
    id
    name
  }
}
```

다시 한 번 정리하자면, 이러한 과정을 거치게 된다.

1. request를 읽어낸다. (request는 string으로 이루어진 쿼리이다.)
2. request를 AST로 parse한다. (Abstract Syntax Tree. [참고](https://www.contentful.com/blog/2018/07/04/graphql-abstract-syntax-tree-new-schema/))
3. AST에 있는 모든 노드에 대해 resolver 함수를 불러낸다.
4. 그 노드의 하위 노드들에 대해서도 resolver 함수를 불러내고.. 노드의 끝까지 반복한다.
5. reslover 안에 있는 data 서비스가 요청된다. (db에 대한 요청)
6. 결과적으로 resolver 함수로 부터 반환된 모든 데이터 들을 하나의 객체로 합친다.
7. 클라이언트에 response 한다.

위와 과정을 거쳐 위와 같은 쿼리를 실행하였을 때,

```
{
  "data": {
    "user": {
      "id": "123",
      "name": "LTH"
    }
  }
}
```

이런 결과를 받아올 수 있다.

## 결론

이 글에서는 GraphQL의 실제 구현보다는 어떻게 동작하는지에 대해 초점을 두었다.
사용하면서 느낀 것은 확실히 뭔가 마법같은 동작을 하고 유연하게 개발할 수 있다. 하지만, 너무 유연해서 처음 하기에는 힘든 부분이 많은 것 같다. 그래도 확실한 개념만 이해해두면 재밌게 개발할 수 있는 것 같다.

아마 다음 graphQL 글을 쓸 때는 실제로 구현이나 n+1문제를 해결하는 방법에 대해 쓸 것 같다.

## 참고

https://www.howtographql.com/ (혼자 공부할 때 도움이 많이 된 사이트)
