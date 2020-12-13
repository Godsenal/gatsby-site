---
title: Github Page로 Blog 만들기
date: '2018-02-02'
categories:
  - blog
tags:
  - github
  - blog
  - jekyll
banner: /images/post_01/githubpage.jpg
---

기존에 서버 호스팅해서 블로그를 사용하다가 블로그는 편한게 최고다라는 생각에 **Github page**를 이용한 blog로 넘어오게 되었다.

최고의 장점은 **매우 쉽게 만들 수 있다는 것**.

물론 **tistory** 같은 블로그 서비스도 쉽지만, 보다 더 자유롭게 구축 가능하기 때문에 선택하였다. 무엇보다 한 번 만들어보고 싶었다.

이 블로그는 hexo를 사용하였지만, jekyll이 조금 더? 대중적이고 공식적으로 지원되므로 jekyll을 이용하여 만들어 보자.

<!--more-->

# 만들어봅시다

## Github?

개발 공부를 하는 사람이라면 모두 github를 알겠지만 그렇지 않다면 모를 수 도 있다.

설명하자면 **version control system**을 호스팅 해주는 서비스이다. 개발자가 무언가를 개발할 때 코드가 업데이트 되고 새로운 버전을 출시하던가 하는 일이 벌어진다.

이런걸 관리하고 저장하는게 git인데(그 장소를 repository라고 한다), github는 이 repository를 호스팅해주는 서비스라고 할 수 있다. 호스팅만 해주는 건 아니고 여러 장점이 있다.

쨋든 이 github라는 서비스를 이용해 블로그를 만들 것이다.

## Github Repository 생성

먼저 github 계정이 없다면 가입하고 있다면 [여기](https://github.com/new)서 git repository를 생성한다.

위 repository name 필드는 **_username_.github.io** 로 만든다.(*username*은 본인의 github username)

## Repository Clone

그 다음 프로젝트를 저장할 장소를 정한 후, 만든 repository(이하 repo)를 clone 한다.

github를 처음 사용한다면 간단히 github에 만들어진 repo를 로컬 저장소에 복사한다고 생각하자.

터미널에서 밑 과정을 진행하면된다. (git이 없다면 [여기서 설치](https://git-scm.com/book/ko/v2/%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0-Git-%EC%84%A4%EC%B9%98))

```bash
~$ git clone https://github.com/username/username.github.io
```

## 기본 파일 생성 후 push

clone한 프로젝트에 들어간 후, 메인 페이지가 될 html파일을 작성.

```bash
~$ cd username.github.io
~$ echo "My first blog" > index.html
```

그리고 변경된 파일을 git repo에 push만 해주고,

```bash
~$ git add --all
~$ git commit -m "Initial commit"
~$ git push -u origin master
```

`https://username.github.io` 에 들어가보면 아까 만들어준 index.html이 적용된 모습을 볼 수 있다. 아직 일반적으로 생각하는 블로그의 모습은 아니지만 무료로 이렇게 쉽게 만들 수가 있다!

이제 Jekyll을 이용하여 블로그답게 만들어 보자.

# Jekyll 이용하기

## Jekyll?

Jekyll은 HTML, Markdown 같은 마크업 언어로 글을 작성하면 정해 놓은 규칙에 따라 다양한 레이아웃으로 정적 웹사이트를 만들어 주는 **정적 사이트 생성 엔진** 이다. 자세한 설명은 [이 글](http://t-robotics.blogspot.kr/2016/04/jekyll.html)을 보면 될 것 같다.

## Jekyll 설치

Jekyll은 Ruby 패키지이므로 Ruby가 있어야 한다.

window에서 Jekyll 설치는 조금 복잡하다. [이 글](https://blog.psangwoo.com/coding/2017/04/02/install-jekyll-on-windows.html)을 보며 설치를 하자.

Mac에서는 Ruby가 이미 존재하므로 Ruby에서 패키지를 관리하는 Gem(Node의 npm 같은 것)을 통해 jekyll과 bundler(다른 gem들을 관리)를 받자.

```bash
~$ sudo gem install jekyll bundler
```

## 로컬에서 Jekyll 시작.

이제 Jekyll을 이용해 사이트를 만들어 보자. `jekyll new directory` 명령어를 이용해 해당 directory에 만들 수 있다.

우리는 아까 받은 git repo에 만들 것이므로 해당 디렉토리로 이동 후 명령어를 입력한다.

```bash
~$ jekyll new .
```

그러면 잠시 후 현재 디렉토리 안에 여러 폴더와 파일들이 생성되었을 것이다.

```
404.html     Gemfile.lock _posts       index.md
Gemfile      _config.yml  about.md
```

그럼 github page로 등록하기 전 로컬에서 테스트를 해보자

```bash
~$ bundle exec jekyll serve
```

정상적으로 실행이 되었다면 <http://localhost:4000> 에 접속하였을 때 정상적인 화면이 뜰 것이다.

## github page에 배포

이제 모두 준비가 끝났으니 현재 로컬 저장소에 변경된 내용을 github page에 배포해보자.

```bash
~$ git add .
~$ git commit -m "jekyll setting"
~$ git push origin master
```

아까 처음 github page 만들었을 때 index.html을 넣어준 과정과 같다.
이제 `https://username.github.io`로 접속하면 아까 테스트한 페이지가 보일 것이다.

## Jekyll 테마 적용

마지막으로 테마를 적용해보자.

<http://jekyllthemes.org/> 여기서 원하는 테마를 받을 수 있다.

이 글 작성시간 기준 제일 앞에 있는 `Prologue`라는 테마를 적용시켜보자. 아마 대부분의 테마가 같은 방식으로 적용될 것이다.

![jekyll theme](/images/post_01/jekyll-prologue.png)

테마를 적용하려면 먼저 다운받아야 하는데 1. git clone을 이용해 github에 저장되어 있는 테마를 받는 방법 2. 그냥 압축파일로 다운받는 방법이 있다.

이미 jekyll이 우리의 git repo로 적용되어 있기 때문에 1번으로 하려면 다른 장소에 clone한 후 옮겨줘야 하는데 귀찮으니까 2번으로 하자.

위 사진에서 다운로드를 클릭하여 압축파일을 받은 후 압축을 우리의 git repo에 덮어 씌우자.

그리고 아까와 같이 터미널에 `~$ bundle exec jekyll serve`을 입력한 후 <http://localhost:4000>에 들어가 주면 잘 적용된 것을 볼 수 있다.

Title같은 것들이 적용되어 있지 않은 모습을 볼 수 있는데, Jekyll에서 이러한 사이트의 기본 정보들 및 설정을 `_config.yml`에서 한다.

들어가보면 title, url 과 같은 여러 설정들이 있을 것인데, 자신의 사이트에 맞게 설정해주면 된다. Theme마다 설정이 다른 부분이 있기 때문에 대부분의 theme에서 주석으로 어떻게 설정해야 하는지 잘 알려준다.

이제 마지막으로 아까와 같은 과정으로 github에 배포하면 완성이다.

# 결론

해보면 정말 쉽다는 것을 알 수 있다. 20분?도 안 걸리니 누구나 한 번쯤은 자신만의 블로그를 만들어보는 것도 좋을 것 같다.
