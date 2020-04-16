---
title: github action으로 리마인더 만들기
date: '2020-04-16'
tags:
  - github
  - github action
categories:
  - dev
---

알고리즘 스터디를 진행하면서 리마인더를 하나 만들어보고 싶은 생각이 들었다. 크론잡을 어떻게 만들까.. 찾아보다가 github action에 스케쥴을 설정할 수 있다는 것을 보고 한번 만들어보았다.

어떻게 만들었는지와 해당 액션을 만들면서 테스트 했던 방법을 적어보려고 한다.

## Github Action

[Github Action](https://help.github.com/en/actions)은 특정 이벤트 또는 스케쥴에 정해진 워크플로우를 실행할 수 있도록 도와주는 도구이다. push 이벤트에 테스트를 진행하던가 하는 전형적인 CI/CD 관련 워크플로우를 생성할 수도 있고, 지금 만드려는 것처럼 정해진 스케쥴에 따라 리마인더를 해주는 액션도 생성해줄 수 있다.

요번에 만들었던건, 매주 목요일 오후 7시에 가장 최근 이슈를 확인하고 slack에 해당 이슈 내용을 메시지로 보내는 리마인더이다.

## Github Action 생성

Github Action을 생성하는 방법으로는 yml 파일을 생성해서 `.github/workflows/*.yml` 과 같은 형태로로 레포지토리에 올리는 방법과, 레포지토리내에 action 탭을 이용하는 방법(어차피 yml을 생성해준다)이 있다. 여기선 yml을 직접 만들어서 올려보자.

먼저 내가 하려는 작업은 다음과 같다.

1. 매주 목요일 오후 7시에
2. ubuntu 환경에서
3. 현재 레포를 받고
4. node와 패키지들을 설치하고
5. 미리 지정해둔 `npm run reminder` 라는 스크립트를 실행

요것을 yml파일로 생성하면 다음과 같다.

```yml
name: Reminder

on:
  schedule:
    - cron: '0 10 * * THU'

jobs:
  remind:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          ref: 'reminder'
      - uses: actions/setup-node@v1
        with:
          node-version: '12.x'
      - run: npm install
      - run: npm run reminder
```

이 워크플로우는 Reminder라는 이름을 가지고, UTC 시간 기준 매주 화요일 오전 10시에 실행된다(해당 스크립트를 실행시키는 환경이 UTC 시간을 기준으로 되어있으므로 한국시간 - 9시간인 UTC 시간을 넣어줘야 한다).

`on` 에는 이 워크플로우가 실행되는 시점을 설정해주는데, push와 같은 github 이벤트들을 넣어줄 수도 있다.

`jobs` 에는 어떤 작업을 할지를 넣어주도록 한다. `remind` 라는 작업을 넣어주었고 해당 작업은 `ubuntu-latest` 환경에서 동작하도록 설정해주었다.

> 다음과 같은 가상환경을 지원한다고 하니 참고하자.

| Virtual environment  | YAML workflow label            |
| -------------------- | ------------------------------ |
| Windows Server 2019  | windows-latest or windows-2019 |
| Ubuntu 18.04         | ubuntu-latest or ubuntu-18.04  |
| Ubuntu 16.04         | ubuntu-16.04                   |
| macOS Catalina 10.15 | macos-latest or macos-10.15    |

이제 `remind` 라는 작업에서 할 태스크들을 `steps`에 넣어주도록 하자. 먼저, 마켓플레이스에 있는 [checkout 액션](https://github.com/marketplace/actions/checkout) 과 [setup-node 액션](https://github.com/marketplace/actions/setup-node-js-environment)을 이용할 것이다. 두 액션들은 모두 github에서 만든 기본적인 액션들이다.

`checkout` 은 특정 레포(기본은 현재 레포)를 워크플로우에서 접근 가능하도록 체크아웃 해주고, `setup-node` 는 nodejs를 실행할 수 있는 환경을 만들어준다. 각각 부가적인 옵션들이 있으므로 확인해보자.

나는 미리 파둔 `reminder` 라는 브랜치를 체크아웃 하기 위해서 `ref` 옵션으로 해당 브랜치 이름을 주었다.

그럼 현재 레포의 `reminder` 브랜치를 체크아웃한 상태일 것이고, nodejs 12.x 환경이 세팅된 상태일 것이다.
그 다음 `run` 옵션을 통해 두 커맨드를 실행시켜준다.

```bash
npm install
npm run reminder
```

그러면 npm 패키지들을 받아서 `package.json` 에 있는 `reminder` 스크립트를 실행할 것이다.

## 실행할 스크립트 만들기

부가적인 것이지만 실행할 스크립트를 만들어보자. 나는 가장 최근 이슈를 가져와서 슬랙에 메시지를 보내는 스크립트를 작성했다.

```ts
const { slackApi, githubApi } = require('../fetcher');
const { GITHUB_DATA } = require('../constants');

require('dotenv').config();

const { owner, repo } = GITHUB_DATA;

(async () => {
  try {
    const { data } = await githubApi.get(`/repos/${owner}/${repo}/issues`);
    const latestIssue = data.find(({ pull_request }) => !pull_request);

    const { title, url, body } = latestIssue;

    const text = `
  
  *[:rocket: 이번 주 알고리즘]*
  <${url}|${title}>
  *[내용]*
  ${body}
    `;

    await slackApi.post(
      '/chat.postMessage',
      {
        token: process.env.SLACK_AUTH_TOKEN,
        channel: '#algorithm',
        text,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_AUTH_TOKEN}`,
        },
      },
    );
  } catch (err) {
    console.log(err);
  }
})();
```

다른 것은 부가적인 것이고 아마 도움이 될만한 것은 `process.env` 에 값을 집어넣는 방법일 것이다. Slack API와 Github API를 이용하기 위한 auth 토큰을 env로 넣어주었는데, 개발환경에서는 `.env` 파일을 만들어서 넣어주었지만 이를 레포지토리에 올리지 않고 워크플로우 실행시 넣어주기 위해서는 yml 파일에 다음과 같이 추가할 수 있다.

```yml
name: Reminder

on:
  schedule:
    - cron: '0 10 * * THU'

jobs:
  remind:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          ref: 'reminder'
      - uses: actions/setup-node@v1
        with:
          node-version: '12.x'
      - run: npm install
      - run: npm run reminder
        env:
          SLACK_AUTH_TOKEN: ${{ secrets.SLACK_AUTH_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

`secrets` 은 github action에 넣어줄 수 있는 값으로 위와 같이 환경 변수들을 넣어줄 때 용이하다. 해당 값은 레포지토리 설정에서 추가해줄 수 있다.

![Secret](/images/post_github_action/github_secret.jpg)

나는 슬랙 API에 이용할 `SLACK_AUTH_TOKEN`를 넣어준 상태이다.
`GITHUB_TOKEN` 같은 경우는 github에서 액션에서 사용할 수 있도록 [제공해준다](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token). 이외에도 기본적인 [환경 변수](https://help.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables)들이 존재하므로 필요한 것들이 있다면 써보자. 커스텀 secret에는 `GITHUB_` prefix를 사용할 수 없음에 유의하자.

## 워크플로우 테스트 해보기

젤 골치아팠던게, 이 워크플로우가 제대로 동작할지 테스트 해보는 것이였다. 심지어 레포지토리에 있는 액션 탭에는 실행되지 않은 워크플로우는 뜨지도 않아서 더 불안하게 만든다. 요럴 때 사용해볼 수 있는 라이브러리가 있는데 바로 [act](https://github.com/nektos/act) 이다.

요 라이브러리는 github 액션을 로컬에서 실행할 수 있도록 도와주는 라이브러리이다. github 액션은 가상환경에서 동작하기 때문에 docker는 있어야 한다.

해당 라이브러리를 위 링크에서 환경에 따라 설치한 후에 `.github/workflows/{action 이름}.yml` 이 존재하는 레포에서 `act` 커맨드를 실행시켜주면 로컬에서 실행해주기 때문에 테스트하기 간편하다.

그외에 옵션들이 있는데 위에서 본 `secret` 같은 것도 환경 변수로 넣어줄 수 있으므로 편하게 테스트 해보자.

> 실행시킬 때 RUNNER_TEMP... 와 같은 에러가 난다면 setup-node 액션 옵션을 다음과 같이 설정해보자.

```yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          ref: 'reminder'
      - uses: actions/setup-node@v1
        with:
          node-version: '12.x'
        env:
          RUNNER_TEMP: '/tmp/'
```

`act` 에서 발생하는 에러같은데 정확히 어떤 원인인지는 모르겠다.

## 여담

위에서 act와 같은 라이브러리 사용을 위해 Docker를 사용해야 될때, wsl 환경에서 안하고 powershell 켜서 하던가 맥북을 켜서 했는데 wsl2에서 엄청 편하게 docker를 사용할 수 있었다.. 나온지 꽤 된 것 같은데 모르고 있었다.

wsl2를 사용하고 있다면, 윈도우용 도커 데스크탑 최신 버전을 설치하고 설정에 들어가보면 다음과 같은 옵션이 있다.

![wsl-docker](/images/post_github_action/wsl-docker.jpg)

요거 키고 wsl2 재시작하면 끝! 바로 docker 사용 가능이다.
