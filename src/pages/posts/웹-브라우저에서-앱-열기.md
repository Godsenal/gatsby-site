---
title: 웹 브라우저에서 앱 열기
date: '2022-03-12'
tags:
  - web
  - app
categories:
  - dev
---

이번에 일을 하면서 웹에서 앱 열기, 인앱 등 앱과 연결되어 일하는 부분이 꽤 많이 생겼다. 인앱 대응이야 해본 경험이 있었지만, 앱 열기의 경우 꽤나 까다로웠다. 관련된 용어가 많고 OS 별로 다르다 보니 헷갈리는 포인트가 많았는데, 이 부분을 정리해보았다.

<!--more-->

## 딥링크

앱 열기를 찾아보다보면 딥링크라는 단어가 자주 보이게 된다. 그 의미 자체는 앱에 한정적인게 아니고 "사용자를 특정 콘텐츠로 연결하는 링크"인데, 이게 보통 "앱에서" 특정 콘텐츠로 연결하는 링크라는 의미로 많이 쓰인다.

워낙 해당 단어가 자주 나오다보니 딥링크가 앱을 여는 하나의 방식인가? 라고 착각을 했었는데, 아래 후술할 방식이 모두 다른 종류의 딥링크이다. 즉, 모두 앱에서 특정 콘텐츠로 연결하는 링크인 것이다.

앱 열기 같은 경우 OS(Android, iOS) 별로 방법이 다른 부분이 꽤 있는데, 나눠서 비교해보자.

## 공통

### URL Scheme

사용자를 앱의 특정 콘텐츠로 바로 연결하는 URL 이다.

ex) `naversearchapp://`

위와 같은 URL Scheme를 이용하면 브라우저에서 해당 Scheme를 읽고 그 Scheme에 해당하는 앱이 있는 경우 (앱에서 설정) 열어준다.

하지만 다음과 같은 한계가 있다.

- `naversearchapp` 같이 앞에 붙는 스키마는 유니크한 값이 아니기 때문에 같은 이름이 있을 경우 어떤앱을 열지 물어보게된다.
- 앱이 미설치되어있는 경우 동작하지 않는다.

## Android

### intent filter

[https://developer.android.com/guide/components/intents-filters?hl=ko](https://developer.android.com/guide/components/intents-filters?hl=ko)

이 intent filter의 역할은 앱 열기에 한정된 것이 아니고 특정 앱으로의 메시징을 처리하는 객체인데, 이걸 딥링크처럼 활용할 수 있다.

앱에서 intent관련 설정을 지정하고, 웹에서 `intent://` 와 같이 실행하면 앱을 실행할 수 있다.

이 방법은 위 URL 스키마 방식의 한계를 없애준다.

패키지명을 이용하기 때문에 유니크하고, 앱이 미설치되어있는 경우 해당 패키지에 해당되는 playstore로 이동한다.

### Applink

[https://developer.android.com/training/app-links/verify-site-associations?hl=ko](https://developer.android.com/training/app-links/verify-site-associations?hl=ko)

위 인텐트 필터 방식을 활용하여 웹사이트 URL 기반으로 앱을 여는 방식 (android 6.0 이상지원)

예를들어 [https://medium.com](https://medium.com) 를 방문하는 경우 해당하는 앱을 열 수 있다.

#### 웹에서는 무엇을 해주어야 하나?

기본적으로 인텐트 필터 설정은 앱쪽에서 해주지만, 웹에서도 해줘야할 것이 있다.

앱링크를 제공할 도메인이 특정 앱과 매칭된다는 것을 알려주기 위해 앱쪽에서 생성하는 **`assetlinks.json`** 를 `https://{도메인}/.well-known/assetlinks.json` 에 제공해줘야한다.

여기에는 몇 가지 제약이 따르게 되는데,

1. HTTPS만 지원한다.
2. `assetlinks.json` 를 가져오는데에 있어서 리디렉션이 일어나지 않아야하고 `application/json` 타입으로 응답되어야한다.
3. 서브도메인이 다른 경우 모두 `assetlinks.json` 제공이 필요하다. 예를들어 [www.medium.com](http://www.medium.com) 와 [m.medium.com](http://m.medium.com) 가 존재한다면, `assetlinks.json` 를 모두 제공해야한다.
4. `robot.txt` 가 접근가능해야한다. 즉, VPN 등이 있어야 접근가능한 경우 적용 불가능하다.

#### 테스트는 어떻게하지?

이부분이 제일 골치아팠는데, 위와 같은 제약사항이 있기 때문에 VPN을 사용하거나 사내망이 따로 있는 경우 테스트하기가 번거롭다.

예를들어, 개발환경인 `dev.aa.com` 가 있고, 실제환경인 `aa.com` 이 있다고 했을 때 위 제약사항이 있기 때문에 `assetlinks.json`을 두 환경을 제공하는 서버 각각 넣어줘야한다.

대부분에 개발환경 서버는 VPN 뒤에 있기 때문에 위 4번 제약사항에 걸리게 된다.

이 때 찾아보았던 해결할 수 있는 방법은

1. 만약 `dev.aa.com` 과 `aa.com` 과 같이 서브도메인 / 루트도메인의 관계라면 루트도메인에 `assetlinks`를 `*.aa.com` 과같이 설정함으로써 적용이 가능하다.
2. `app.dev.aa.com` 과 같은 서버를 실제환경에 열어두고 여기서 테스트를 진행한다.

#### 앱이 설치되어있지 않은 경우는?

기본적으로 앱링크 / 유니버셜링크는 앱이 설치되어있지 않은 경우 단순히 웹에서 해당 url을 표시하게 된다. 이런 경우 보통 "앱으로 이동" 과 같은 버튼을 표시하고, 클릭시 위에서 말한 인텐트 필터를 사용하게 된다.

## iOS

ios의 경우 deffered deep link나 intent 필터 등의 기법은 없고 universal 링크만 이용 가능하다. (ios 9 이상)

### Universal link

[https://developer.apple.com/ios/universal-links/](https://developer.apple.com/ios/universal-links/)

기본적으로 app link와 동일하다. 웹사이트 URL 기반으로 앱을 열게 동작해준다.

#### 웹에서는 무엇을 해주어야 하나?

안드로이드와 마찬가지로 `.well-known` 하위에 파일 추가가 필요하다. (다른점은 루트 디렉토리에 넣어도 무방)

앱쪽에서 생성한 `apple-app-site-association` 파일을 넣어주게되는데, 마찬가지로 `application/json` 타입 제공이 필요하다.

주의할 점은, 안드로이드의 경우 `assetlinks.json` 의 파일 포맷이 `json` 이라 브라우저가 알아서 `json` 으로 처리해주는 반면, 해당 파일은 파일 포맷이 없으므로, 명시적으로 제공이 필요하다.

기본적인 제약사항 (VPN X, redirect X, 서브도메인지원 X)은 앱링크와 동일하다.

따로 문서에 명시되어있지는 않은데, 테스트 결과 앱링크와 마찬가지로 앱쪽에서 `*.루트도메인` 과 같이 설정한 경우 루트도메인에 넣은 설정파일로 서브도메인 지원이 가능하다.

#### 앱이 설치되어있지 않은 경우는?

마찬가지로 앱열기버튼을 제공할 수 있다. (특히 유니버셜링크는 safari의 경우 앱열기버튼을 네이티브에서 제공하고 있다)

다만, iOS에서는 인텐트 필터처럼 앱의 설치여부를 구분해서 동작할 수 없기 때문에 조금 추가작업이 필요하다.

다음과 같은 방법을 고려할 수 있다.

- [firebase 다이나믹링크](https://firebase.google.com/docs/dynamic-links), [브랜치](https://branch.io/ko/) 등 외부 서비스를 이용하는 방식 (ex ) Medium, reddit )
  - 위 서비스들이 앱 설치/미설치시 분기처리를 제공해준다. Android의 경우 내부적으로 인텐트 필터를 이용하는 것으로 보인다.
- 직접 처리하는 방식
  - 라우트를 https://aa.com/launchApp 과 같이 지정해놓고, 해당 라우트로 리디렉션 시킨다.
  - 만약 앱이 설치되어 있다면 유니버셜링크를 통해 서버에 접근하지않고 바로 앱이 열릴테고, 앱이 설치되어있지 않다면 해당 라우트로 들어오고 fe 서버에서 app store로 리디렉션 시킬 수 있다.
