1. git clone

2. code.gs에 있는 코드를 Google Apps Script에 붙여넣기

3. 새로운 웹앱 배포를 하여, 생성된 url을 index.html 속 addrScript = "{새로운 url}" 에 넣기

<!-- 3-1. 이때 google apps script 편집기 내에서, generateText 함수를 실행해보고, 실행 로그에서 권한 요청 오류가 뜨는데도 권한 허용 팝업이 뜨지 않는다면, 아래의 코드 블럭을 넣고 편집기에서 함수 실행하기. 
`function testFetch() {
  var response = UrlFetchApp.fetch("https://httpbin.org/get");
  Logger.log(response.getContentText());
}`

-->

4-1. 로컬로 index.html을 브라우저로 들어가서 실행하기

4-2. 배포를 위해서 netlify에 code.gs 파일을 제외한 프로젝트 전체를 넣고 배포하기