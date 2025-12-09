## 코드 사용법

### 1. 프로젝트 준비

1. 이 저장소를 클론합니다.
   ```bash
   git clone https://github.com/yunbeeee/MindSketch.git
   ```
2. `code.gs` 파일 내용을 **Google Apps Script** 편집기에 그대로 붙여 넣습니다.

---

### 2. OpenAI API 키 설정

Google Apps Script 편집기에서:

1. 좌측 **톱니바퀴(프로젝트 설정)** 클릭  
2. **스크립트 속성** → `+ 속성 추가`  
3. 아래 값 입력 후 저장

- **속성 이름**: `OPENAI_API_KEY`  
- **값**: 교수님께 이메일로 전달드린 API 키

---

### 3. 웹 앱 배포 및 URL 연결

1. Google Apps Script 상단 메뉴에서 **배포 → 새 배포** 선택  
2. 유형: **웹 앱**  
3. 설정

   - 실행 사용자: 나
   - 액세스 권한: **모든 사용자**

4. **배포** 후 생성된 웹 앱 URL 복사  
5. 로컬 `index.html`에서 아래 부분을 새 URL로 교체

   ```javascript
   const addrScript = "https://script.google.com/macros/s/.../exec";
   ```

---

### 4. 실행 방법

#### 4-1. 로컬 실행

1. 파일 탐색기에서 `index.html`을 더블 클릭해 브라우저(Chrome 등)로 열기  
2. 페이지에서 **사연 입력 → 동화 문장 생성 → (선택) 일러스트 생성 → 편지 저장**까지 동작 확인

#### 4-2. Netlify 배포 (선택)

1. `code.gs`를 제외한 프론트엔드 전체 폴더를 Netlify에 업로드  
2. 별도 빌드 설정 없이 **Static Site**로 배포  
3. 배포된 URL에서 동일하게 기능 테스트

---

### 5. 권한 오류 발생 시 해결 방법

Google Apps Script 실행 로그에 권한 오류가 뜨는데  
권한 허용 팝업이 보이지 않는다면 아래 절차를 사용합니다.

1. `code.gs`에 아래 함수를 임시로 추가합니다.

   ```javascript
   function testFetch() {
     var response = UrlFetchApp.fetch("https://httpbin.org/get");
     Logger.log(response.getContentText());
   }
   ```

2. Apps Script 편집기에서 함수 목록에서 `testFetch` 선택 → **실행**  
3. 권한 요청 팝업이 뜨면 안내대로 **권한 허용**  
4. 이후 `testFetch` 함수는 삭제해도 되고 그대로 두어도 무방  
5. 다시 웹 앱 URL로 접속해 기능을 재시도합니다.


