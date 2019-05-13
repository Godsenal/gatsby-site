# Godsenal's blog

Godsenal의 블로그 입니다.

Gatsby를 통해 만들었습니당.

## 글 작성하기

### Post

`src/pages/posts/~.md` 에 생성합시다.

**CLI(편하려고 만들었는데 이거 쓰자)**
```
npm run post
```

**임의 작성**

이런 형식으로 써줍시다.

```yaml
---
title: Hi
date: "2019-05-05"
[categories]:
  - dev
[tags]:
  - react
---

안녕하세용
```
`[]`는 생략 가능

### Project

Json 형식
```json
{
  "title": "Owesome Gwent",
  "description": "Gwent 게임의 카드 정보 확인과 덱 빌딩을 도와주는 사이트입니다.",
  "date": "2018-10-02",
  ["git"]: "https://github.com/OwesomeGwent/owesome-gwent",
  ["website"]: "http://owesomegwent.me",
  ["stacks"]: ["typescript", "react", "nodejs"]
}
```
`[]`는 생략 가능
