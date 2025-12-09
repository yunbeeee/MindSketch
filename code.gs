			function doGet(req) {

				// return ContentService.createTextOutput(JSON.stringify(req));
			      
			       // req가 없거나 parameter가 없을 때 처리
			       if (!req || !req.parameter) {
			         return ContentService.createTextOutput(JSON.stringify({
			           error: "잘못된 요청입니다."
			         })).setMimeType(ContentService.MimeType.JSON);
			       }
			      
			       var SHEET_URL = "https://docs.google.com/spreadsheets/d/1_Jy4OSzu3Ha5yONSoLHoFQQm563Yl9Wtx2BwfBxa9NM/edit"
			       var SHEET_ID = "...."
			       var action    = req.parameter.action;
			       var table_req = req.parameter.table;
            //var db    = SpreadsheetApp.openById( SHEET_ID );
			       var db = SpreadsheetApp.openByUrl(SHEET_URL);
			       var table = db.getSheetByName( table_req );
			       var ret;
			    
			       // MVT: generate와 generateImage는 table이 필요 없음
			       if (action === "generate") {
			         var story = req.parameter.story;
			         var userId = req.parameter.id || ""; // UUID (선택사항)
			         if (!story) {
			           return ContentService.createTextOutput(JSON.stringify({
			             error: "사연이 전달되지 않았습니다."
			           })).setMimeType(ContentService.MimeType.JSON);
			         }
			         return generatePreview(story, userId);
			       }
			       if (action === "generateImage") {
			         var text = req.parameter.text; // 생성된 동화 문장
			         var story = req.parameter.story || ""; // 원본 사연 (선택사항)
			         var userId = req.parameter.id || ""; // UUID (선택사항)
			         if (!text) {
			           return ContentService.createTextOutput(JSON.stringify({
			             error: "텍스트가 전달되지 않았습니다."
			           })).setMimeType(ContentService.MimeType.JSON);
			         }
			         return generateImage(text, story, userId);
			       }
             if (action === "saveLetter") {
			         return saveLetter(req);
			       }
			  
				  
			       switch(action) {
				case "read":
				    ret = Read( req, table );
				    break;
				case "insert":
				    ret = Insert( req, table );
				    break;
				case "update":
				    ret = Update( req, table );
				    break;
				case "delete":
				    ret = Delete( req, table );
				    break;
				default:
				    break;
				}
			
				return response().json(ret);
			    }
			    
			    /* Read
			     * request for all tables
			     *
			     * @parameter action=read
			     * @parameter table=
			     * @parameter id=
			     *
			     * @example-request | ?action=read&table=
			     * @example-request-single-row | ?action=read&table=&id=
			     */
			    function Read( request, table ) {
			      var request_id = Number( request.parameter.id );
			      return {
				success: true,
				data: _read( table, request_id )
			      };
			    }
			    
			    /* Insert
			     * dynamic for all data
			     *
			     * @parameter action=insert
			     * @parameter table=
			     * @parameter data=JSON
			     *  
			     * @example-request | ?action=insert&table=&data={"name":"John Doe"}
			     */
			    function Insert( request, table ) {
			      var errors = [];
			      
			      var last_col     = table.getLastColumn();
			      var first_row    = table.getRange(1, 1, 1, last_col).getValues();
			      var headers      = first_row.shift();
			      var data         = JSON.parse( request.parameter.data );
			      var new_row;
			      var result = {};  
			    
			      try {
				new_row = prepareRow( data, headers );
				table.appendRow( new_row );
				
				result.success = true;
				result.data = data;
			      } catch ( error ) {
				result.success = false;
				result.data = { error: error.message };
			      }
			      return result;
			    }
			    
			    /* Update
			     * dynamic for all tablese
			     *
			     * @parameter action=update
			     * @parameter table=
			     * @parameter id=
			     * @parameter data=JSON
			     * 
			     * @example-request | ?action=update&table=&id=&data={"col_to_update": "value" }
			     */
			    function Update( request, table ) {
			      var last_col      = table.getLastColumn();
			      var first_row     = table.getRange(1, 1, 1, last_col).getValues();
			      var headers       = first_row.shift();
			      
			      var request_id    = Number( request.parameter.id );
			      var current_data  = _read( table, request_id );
			      var data          = JSON.parse( request.parameter.data );
			      
			      var result = {};
			      
			      try {
				var current_row   = current_data.row;
				for( var object_key in data ) {
				  var current_col = headers.indexOf( object_key ) + 1;
				  table.getRange( current_row, current_col ).setValue( data[ object_key ]); // update iteratively
				  current_data[ object_key ] = data[ object_key ]; // update for response;
				}
				result.success = true;
				result.data = current_data;
			      } catch ( error ) {
				result.success = false;
				result.data = { error: error.message };
			      }
			      
			      return response().json( result );
			  }
			    
			    /* Delete
			     * dynamic for all tables
			     *
			     * @parameter action=delete
			     * @parameter table=
			     * @parameter id=
			     * 
			     * @example-request | ?action=update&table=&id=
			     */
			    function Delete( request, table ) {
			      var request_id    = Number( request.parameter.id );
			      var current_data  = _read( table, request_id );
			      
			      // delete
			      table.deleteRow( current_data.row );
			      
			      return response().json({
				  success: true,
				  data: current_data
				});
			    }
			    
			    /**
			     * Build the response content type 
			     * back to the user
			     */
			    function response() {
			       return {
				  json: function(data) {
				      return ContentService.createTextOutput(
					    JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
				  },
				  jsonp: function(req, data) {
				    return ContentService.createTextOutput(
				      req.parameters.callback + '(' + JSON.stringify(data) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
				  }
			       }
			    }
          function generatePreview(story, userId) {
            try {
              var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
              if (!apiKey) {
                return ContentService.createTextOutput(JSON.stringify({ error: "API 키가 설정되지 않았습니다." })).setMimeType(ContentService.MimeType.JSON);
              }
              var prompt = `
                당신은 ‘따뜻한 감성의 동화 작가’입니다.

                아래 사용자의 사연을 바탕으로,
                감정의 흐름을 섬세하게 이해하고,
                위로와 희망을 전달하는 ‘짧은 동화 한 장면’을 작성하세요.

                [작성 규칙]
                - 따뜻하고 잔잔한 분위기
                - 과하지 않은 위로
                - 은유적 표현·자연 요소 활용
                - 어른도 위로받는 동화 감성
                - 3~5문장 구성의 한 단락
                - 캐릭터 구체 외형 묘사는 넣지 않기
                - 이미지화를 방해하는 과도한 디테일 금지
                - 순수한 텍스트만 출력 (제목/불릿/설명 없음)

                [사용자 사연]
                ${story}

                ‘동화풍 위로 문장’만 작성하세요.
                `;
              var url = "https://api.openai.com/v1/chat/completions";
              var options = {
                method: "post",
                headers: {
                  "Authorization": "Bearer " + apiKey,
                  "Content-Type": "application/json"
                },
                payload: JSON.stringify({
                  model: "gpt-4o-mini", 
                  messages: [
                    {
                      role: "system",
                      content: "당신은 따뜻한 동화 작가입니다. 사연을 읽고 감정을 이해한 후, 위로와 희망을 주는 동화풍 문장을 작성합니다."
                    },
                    {
                      role: "user",
                      content: prompt
                    }
                  ],
                  max_tokens: 300,
                  temperature: 0.7
                })  
              };
              var response = UrlFetchApp.fetch(url, options);
              var responseData = JSON.parse(response.getContentText());

              if (responseData.choices && responseData.choices[0]) {
                var previewText = responseData.choices[0].message.content.trim();
                
                // 생성 성공 시 로그 기록
                if (userId) {
                  logGeneration(userId, "generate", story, previewText, "");
                }
                
                return ContentService.createTextOutput(JSON.stringify({
                  preview: previewText
                })).setMimeType(ContentService.MimeType.JSON);
              } else {
                throw new Error("응답 형식이 올바르지 않습니다.");
              }

            } catch (error) {
              Logger.log("Error in generatePreview: " + error.toString());
              return ContentService.createTextOutput(JSON.stringify({
                error: "생성 중 오류가 발생했습니다: " + error.toString()
              })).setMimeType(ContentService.MimeType.JSON);
            }
          }
			    
          function generateImage(text, story, userId) {
            try {
              var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
              if (!apiKey) {
                return ContentService.createTextOutput(JSON.stringify({
                  error: "API 키가 설정되지 않았습니다."
                })).setMimeType(ContentService.MimeType.JSON);
              }

              // 1단계: 원본 스토리와 생성된 동화 문장을 기반으로 DALL-E용 프롬프트 생성
              var imagePrompt = buildImagePrompt(text, story);
              
              // 2단계: DALL-E로 이미지 생성
              var imageUrl = generateImageWithDalle(imagePrompt, apiKey);
              
              // 3단계: 생성 로그 기록
              if (userId) {
                logGeneration(userId, "generateImage", story || "", text, imageUrl);
              }

              return ContentService.createTextOutput(JSON.stringify({
                imageUrl: imageUrl
              })).setMimeType(ContentService.MimeType.JSON);

            } catch (error) {
              Logger.log("Error in generateImage: " + error.toString());
              return ContentService.createTextOutput(JSON.stringify({
                error: "이미지 생성 중 오류가 발생했습니다: " + error.toString()
              })).setMimeType(ContentService.MimeType.JSON);
            }
          }

          // DALL-E용 프롬프트 구성 (보다 구체적인 동화 장면)
          function buildImagePrompt(fairyText, story) {
            var contextNote = story ? 
              "\n\nNote: The illustration should reflect the situation from the original story, as if capturing one gentle picture‑book moment from it." :
              "";
            
            return `IMPORTANT:
- NO text, NO letters, NO words, NO writing, NO captions
- NO signs, NO typography, NO symbols resembling text
(Absolute prohibition. Never include any characters.)

Create ONE coherent, single-frame soft pastel fairy-tale illustration of the following concrete scene, based on the Korean context and fairy‑tale paragraph:
Original story (Korean, if provided):
"${story || ""}"

Fairy‑tale text (Korean):
"${fairyText}"
${contextNote}

Guidelines:
- Show only one moment, not multiple panels, tiles, or separate icons
- Include a clear foreground and background so the viewer can immediately understand the situation
- Use gentle watercolor textures and warm diffused light
- Express the feeling through environment and character pose (light, breeze, flowers, clouds, stars, sprout, etc.)
- Avoid literal depiction of written words or symbolic text
- No realistic human faces – use soft, simplified or slightly abstract forms
- Rounded shapes, soft gradients, dreamy and soothing atmosphere
- Pure illustration only – focus on one clear, easy-to-read story scene`;
          }

          // DALL-E로 이미지 생성
          function generateImageWithDalle(prompt, apiKey) {
            var url = "https://api.openai.com/v1/images/generations";
            var options = {
              method: "post",
              headers: {
                "Authorization": "Bearer " + apiKey,
                "Content-Type": "application/json"
              },
              payload: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                style: "natural"
              })
            };

            var response = UrlFetchApp.fetch(url, options);
            var responseData = JSON.parse(response.getContentText());

            if (!responseData.data || !responseData.data[0] || !responseData.data[0].url) {
              throw new Error("이미지 URL을 받지 못했습니다.");
            }

            return responseData.data[0].url;
          }


			    // 편지 저장 함수
			    function saveLetter(req) {
			      try {
			        // 데이터 파싱
			        var dataStr = req.parameter.data;
			        if (!dataStr) {
			          return ContentService.createTextOutput(JSON.stringify({
			            error: "데이터가 전달되지 않았습니다."
			          })).setMimeType(ContentService.MimeType.JSON);
			        }
			        
			        var letterData = JSON.parse(dataStr);
			        
			        // Google Sheets에 저장
			        var SHEET_ID = "1_Jy4OSzu3Ha5yONSoLHoFQQm563Yl9Wtx2BwfBxa9NM";
			        var db = SpreadsheetApp.openById(SHEET_ID); 
			        // Google Sheets에 저장
			        var sheet = db.getSheetByName("letters");
			        
			        // letters 시트가 없으면 생성
			        if (!sheet) {
			          sheet = db.insertSheet("letters");
			          // 헤더 추가
			          sheet.appendRow(["id", "receiver", "message", "story", "preview", "imageUrl", "timestamp"]);
			        }
			        
			        // 데이터 저장
			        sheet.appendRow([
			          letterData.id || "",
			          letterData.receiver || "",
			          letterData.message || "",
			          letterData.story || "",
			          letterData.preview || "",
			          letterData.imageUrl || "",
			          letterData.timestamp || new Date().toISOString()
			        ]);
			        
			        return ContentService.createTextOutput(JSON.stringify({
			          success: true
			        })).setMimeType(ContentService.MimeType.JSON);
			        
			      } catch (error) {
			        Logger.log("Error in saveLetter: " + error.toString());
			        return ContentService.createTextOutput(JSON.stringify({
			          error: "저장 중 오류가 발생했습니다: " + error.toString()
			        })).setMimeType(ContentService.MimeType.JSON);
			      }
			    }
			    
			    // 생성 로그 기록 함수
			    function logGeneration(userId, action, story, preview, imageUrl) {
			      try {
			        var SHEET_ID = "1_Jy4OSzu3Ha5yONSoLHoFQQm563Yl9Wtx2BwfBxa9NM";
			        var db = SpreadsheetApp.openById(SHEET_ID);
			        var sheet = db.getSheetByName("generations");
			        
			        // generations 시트가 없으면 생성
			        if (!sheet) {
			          sheet = db.insertSheet("generations");
			          // 헤더 추가
			          sheet.appendRow(["id", "action", "story", "preview", "imageUrl", "timestamp"]);
			        }
			        
			        // 데이터 저장
			        sheet.appendRow([
			          userId || "",
			          action || "",
			          story || "",
			          preview || "",
			          imageUrl || "",
			          new Date().toISOString()
			        ]);
			        
			      } catch (error) {
			        // 로그 기록 실패해도 메인 기능에는 영향 없도록
			        Logger.log("Error in logGeneration: " + error.toString());
			      }
			    }
			    

			    /**
			    * Read from sheet and return map key-value
			    * javascript object
			    */
			    function _read( sheet, id ) {
			      var data         = sheet.getDataRange().getValues();
			      var header       = data.shift();
			      
			      // Find All
			      var result = data.map(function( row, indx ) {
			      var reduced = header.reduce( function(accumulator, currentValue, currentIndex) {
				accumulator[ currentValue ] = row[ currentIndex ];
				return accumulator;
			      }, {});
			    
			      reduced.row = indx + 2;
			      return reduced;
			      
			      });
			      
			      // Filter if id is provided
			      if( id ) {
				var filtered = result.filter( function( record ) {
				  if ( record.id === id ) {
				    return true;
				  } else {
				    return false;
				  }
				    });
				      return filtered.shift();
			      } 
			     
			      return result;
			      
			    }
			    
			    /*
			     * Prepare row with correct order to insert into
			     * sheet.
			     * 
			     * @throws Error
			     */
			    function prepareRow( object_to_sort, array_with_order ) {
			      var sorted_array   = [];
			      
			      for( var i=0; i<array_with_order.length; i++ ) {
				      var value = object_to_sort[ array_with_order[ i ]];
				
				      if( typeof value === 'undefined' ) {
					throw new Error( "The attribute/column <" + array_with_order[i] + "> is missing." );
				      } else {
					sorted_array[i] = value;      
				      }
			      }
			    
			      return sorted_array;
			    }
