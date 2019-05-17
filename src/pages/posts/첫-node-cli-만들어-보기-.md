---
title: '첫 node cli로 gatsby 글 쉽게 쓰기'
date: '2019-05-17'
tags:
  - gatsby
  - javascript
  - nodejs
categories:
  - dev
---

Gatsby로 만든 블로그의 글을 쓸 때, 마크다운 파일의 정보를 가져오기 위해서 파일 위에 frontmatter를 
```yaml
---
title: '첫 node cli로 gatsby 글 쉽게 쓰기'
date: '2019-05-17'
tags:
  - gatsby
  - javascript
  - nodejs
categories:
  - dev
---
```
이런식으로 작성하고 있다. 몇 번 작성하다 보니 내가 이걸 왜 일일히 하나 싶어서 위에 있는 몇 개의 요소만 정하면 frontmatter를 작성한 파일을 만들어주는 cli를 만들고 싶었다. cli를 만드는 방법은 여러가지가 있겠지만 나는 당연히 node로 실행시킬 수 있는 javascript로 쉘 스크립트를 만들었다. 까먹기 전에 글로 적어보자.

# 준비

nodejs와 에디터 그리고 몇 개의 npm 패키지들을 사용하였다.

- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/): cli에서 유저와 상호작용 하는 것을 도와준다. 나는 addon으로 `autocomplete`를 사용하였다.
- [gray-matter](https://github.com/jonschlinkert/gray-matter): frontmatter의 파싱과 생성을 도와준다.
- [chalk](https://github.com/chalk/chalk): cli의 글 색깔을 이쁘게 해준당.
- [ora](https://github.com/sindresorhus/ora): 이쁜 spinner를 만들어 준당.
- 그 외 설명이 필요없는 [lodash](https://lodash.com)와 date를 관리해줄 [date-fns](https://date-fns.org/)를 사용하였다.

# 기존 title, category, tag 모으기

먼저, title 중복체크에 사용할 기존 title과 고를 수 있도록 도와주는 기존 category와 tag를 모아보자.

```js
const posts = await readdir(postPath);
const titleSet = new Set();
const categorySet = new Set();
const tagSet = new Set();
posts.forEach(filename => {
  const {
    data: { title, categories, tags }
  } = matter.read(`${postPath}/${filename}`);
  title && titleSet.add(title);
  categories && categorySet.add(...categories);
  tags && tagSet.add(...tags);
});
return [Array.from(titleSet), Array.from(categorySet), Array.from(tagSet)];
```

`postPath`는 post가 들어있는 path이고, readdir은 node에서 제공하는 `fs` 라이브러리의 메서드이다. callback을 넘겨주는 방식이 아닌 promise를 반환하는 방식으로 사용하기 위해서는,

```js
const { promisify } = require("util");
const readdir = promisify(fs.readdir);
```

이렇게 node에서 제공하는 `util`의 `promisify`를 이용하여 할 수 있다.

이렇게 받은 모든 post의 파일 이름을 `gray-matter` 라이브러리인 `matter.read`로 넘겨주게 되면 그 파일의 frontmatter를 반환해준다! 이를 중복을 제거하기 위해 `Set`에 넣어주었다. 사전작업은 이거면 된다.

# cli로 유저와 상호작용하기

유저라고 해봤자 나밖에 없긴하지만... 쨌든 inquirer는 유저와 상호작용 할 수 있는 여러 타입으로 cli를 만들 수 있게 해준다.
input, number, confirm, list ... 등등이 있다.

나는 가장 먼저 제목을 입력 받는 prompt를 만들었다.

```js
  const { title } = await inquirer.prompt({
    name: "title",
    message: "What is your post title?",
    validate: val => {
      return new Promise(res => {
        if (!val || val.length < 2) {
          return res("Title must be 0 ~ 2 length.");
        }
        if (titleList.some(item => item === val)) {
          return res("Title is already exist!");
        }
        return res(true);
      });
    }
  });
  return title;
```
`input`이 기본 타입이기 때문에 따로 타입을 지정해주지 않았다. 이런식으로 `name`을 정하면 그에 해당하는 이름으로 Promise가 걸린 값을 준다. 정말 편하게 `validate`를 할 수가 있는데, Promise를 반환하여 validate 성공시 `true`를 resolve 해주고, 아니면 문자열로 메시지를 resolve 해주면,

![Title](/images/post_cli/title.jpg)

이런식으로 validate 처리를 하여 다시 입력을 받을 수 있도록 해준다.

다음은 category를 고를 때 사용한 `list` 타입이다.

```js
  const createIdentity = -1;
  let result = await inquirer.prompt({
    type: "list",
    name: "categories",
    message: "Select categories.",
    choices: [
      { name: "Create other category.", value: createIdentity },
      ...choices,
      { name: "I don't want to have category...", value: null }
    ]
  });
  if (result.categories === createIdentity) {
    result = await inquirer.prompt({
      name: "categories",
      message: "Type new category.",
      validate: val => {
        return new Promise(res => {
          if (!val || val.length < 2) {
            return res("Category must be 0 ~ 2 length.");
          }
          return res(true);
        });
      }
    });
  }
  return result.categories ? [result.categories] : [];
```

조금 긴데, 새로 만들 category를 처리하기 위해서 이다. 위 처럼 `list` 타입의 프롬프트는 보여줄 `choices` 들을 넣어줘야 한다. 이 때, 고냥 문자열로 넣어줘도 되고, name과 value가 분리된 객체를 넣어줘도 된다. 나는 새로 만드는 것도 넣어주고 싶으므로 새로 만드는 선택지인 `Create other category`를 만들고 그 값을 다른 것과 구분하기 위해 `-1`로 주었다.

그리고 이 list 프롬프트의 결과가 `-1` 이면 새 카테고리를 입력받도록 `input` 프롬프트를 생성하였다.

![Category](/images/post_cli/category.gif)

이런식으로 작동한다. 왼쪽에 엑스박스는 내 터미널이 화살표 기호 지원을 안해줘서 그렇다.

태그도 카테고리와 비슷한데, 여러개를 선택할 수 있게 하고 싶었다.

```js
const handleTags = async (choices, results = []) => {
  const FINISH = [{ name: `OK. DONE!`, value: null }];
  const currChoices = [...diff(choices, results)];
  const { result } = await inquirer.prompt({
    type: "autocomplete",
    name: "result",
    message: "Select a tag.",
    source: (curr, input) => {
      return new Promise(res => {
        if (!input) {
          return res(FINISH.concat(currChoices));
        }
        const searchResult = currChoices.filter(choice =>
          new RegExp(`^${input}`).test(choice)
        );
        // Resolve search results or create Tag
        return res(
          searchResult.length
            ? searchResult
            : [{ name: `create ${input} tag.`, value: input }]
        );
      });
    }
  });
  // FINISH selected
  if (!result) {
    return uniq(results);
  }
  return handleTags(choices, results.concat(result));
};
```

먼저 `FINISH`를 만들어 줘서, 이를 선택하면 지금까지 선택한 값들을 반환하도록 해줬고, 다른 태그를 선택했을 때는 선택된 태그를 현재 까지 저장된 `results`에 넣고 다시 본 함수를 호출해줬다.

`source` 부분은 내가 사용한 inquirer의 addon인 `inquirer-autocomplete`에서 사용하는 것이다. 이 addon은 input이 하나씩 입력될 때마다 source가 호출되고 그 input에 맞는 choices를 resolve 시켜줄 수 있도록 해주도록 도와준다. 한 마디로 검색을 가능하게 해준다.

그래서 `source` 부분을 살펴보면, 일단 `input`이 아무것도 안 들어와 있을 때는 `FINISH`를 포함한 모든 태그를 resolve 시켜줬다. 

그렇지 않을 때는, 현재 input에 매치되는 태그들을 resolve 시켜줬고, 현재 매치되는 태그가 하나도 없을 경우 태그를 생성할 수 있는 선택지를 resolve 해줬다.

![Tag](/images/post_cli/tag.gif)

요런식으로 작동한다.

# 포스트 생성하기

이제 필요한 모든 정보를 받았으니 포스트를 생성해보자.

먼저 지금까지 받은 정보를 `gray-matter`을 이용해서 frontmatter로 만들어보자.

```js
const createMatters = matters => {
  return matter.stringify("", matters);
};
const matters = createMatters(
  omitBy({ title, date, tags, categories }, isEmpty)
);
```

`lodash`의 omitBy를 이용해서 필요없는 정보는 없애주고 frontmatter를 생성하였다.

그리고 이를 이용해 포스트 생성하기전에 유저의 확인을 받아보도록 했다.

```js
log(chalk.magenta("Here is your post..."));
log(chalk.italic(matters));
const { proceed } = await inquirer.prompt({
  type: "confirm",
  name: "proceed",
  message: "Do you want to proceed?"
});
return proceed;
```

여기서 `chalk`를 사용했는데 `console.log` 안에 저런식으로 chalk의 여러 색깔의 메서드를 이용해 메시지를 띄워주면, 그 색으로 글을 출력할 수 있다.

그리고 inquirer의 `confirm` 타입으로 y/n의 컨펌을 받았다.

이제 `fs.writeFile` 을 이용해서 파일을 만들 수 있다.

```js
const createPost = async (title, matters) => {
  const titleWithBar = title.replace(/ /gi, "-");
  const createPath = `${postPath}/${titleWithBar}.md`;
  await writeFile(createPath, matters);
  return createPath;
};
```

띄어쓰기가 포함되어 있으면 파일 이름으로 만들 수 없으므로 띄어쓰기는 모두 '-'로 바꿔주고, 아까와 같이 promisify 한 `writeFile`을 이용하여 글을 생성했다.

이 때, 마지막으로 `ora`를 사용해 이쁜 spinner를 만들어 주자.

```js
const spinner = ora("Creating post...").start();
const createdPath = await createPost(title, matters);
spinner.succeed("Done!");
log(chalk.green(`You can find created post ${chalk.blue(createdPath)}`));
```

이렇게 `ora(message).start()`와 동시에 spinner가 터미널에 뜨고, 작업이 완료되면, `spinner.succeed()` 나 다른 메서드를 통해 멈출 수 있다. 여기서 사용한 `succeed()`는 성공했다는 메시지와 함께 체크 표시를 띄워준다.

![Post](/images/post_cli/post.gif)

원하는 결과의 포스트가 지정해준 경로에 생성된 것을 확인할 수 있다.

마지막으로 `package.json`에 이 스크립트를 실행할 수 있는 커맨드를 지정해주자.

```json
"scripts": {
  //...
  "post": "node cli/post.js",
},
```

이제 `npm run post` 커맨드로 위에서 만든 스크립트를 실행시킬 수 있다.

# 결론

1. 이번 글은 특히 너무 못썼다. 이유가 뭘까?
2. 처음 만들어 봤는데 너무 재밌다. 만들만한 경우가 많이 생길 것 같다. 역시 귀찮으면 안 귀찮은 방법을 찾는구나 싶다.

전체 코드는 [요기서](https://github.com/Godsenal/gatsby-site/blob/master/cli/post.js) 볼 수 있다.

