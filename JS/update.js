const updatebase = "https://hapi.fhir.org/baseR4" ;                                                   //定義 FHIR 伺服器的基礎 API 網址

async function getFHIR(path){                                                                      //定義一個非同步函式，傳入 API 路徑來獲取伺服器上的 FHIR 資料
    const res = await fetch (updatebase+path);                                                     //使用 fetch 發送非同步 GET 請求，拼接完整的 API 網址，並等待伺服器回應

    if(!res.ok)                                                                                    //檢查伺服器回應是否失敗（HTTP 狀態碼非 200~299 區間）
    throw new Error ("取得病例號資料失敗" + res.status);                                           //如果失敗，拋出錯誤訊息並串接該 HTTP 狀態碼（例如 404 代表查無此資料）
    return await res.json();                                                                       //等待將伺服器回傳的回應體解析為 JSON 物件，並將其結果回傳
}

async function putFHIR(path,data){                                                                  //Put請求函式：：定義一個非同步函式，傳入 API 路徑與要更新的完整資料物件
    const res = await fetch (updatebase+path,{                                                      //使用 fetch 發送非同步請求，拼接更新的 API 完整網址，並設定請求設定
        method : "PUT",                                                                             //設定 HTTP 方法為 PUT，告訴伺服器這是要「覆蓋/更新」現有資料
        headers:{"Content-Type" : "application/json"},                                              //設定 HTTP 請求標頭，指定發送的內容格式為 JSON 資料
        body : JSON.stringify(data)                                                                 // 將 JavaScript 資料物件轉成 JSON 字串，放入請求體（Body）中送出
    });
    if (!res.ok)                                                                                    //檢查伺服器回應是否失敗（HTTP 狀態碼非 200~299 區間）
    throw new Error ("更新患者資料失敗!!" + res.status);                                             //如果失敗，拋出錯誤訊息與該 HTTP 狀態碼
    return await res.json();                                                                        //等待將伺服器回傳的回應體解析為 JSON 物件，並將其結果回傳
}

async function updatePatientData (id,family,given,birthDate,phone,email){                           //定義一個非同步函式來更新病人資料，傳入要修改的病歷號以及各項表單新數值
    const res = await getFHIR("/Patient/" + id);                                                    //先呼叫 getFHIR 獲取該病人目前在伺服器上最完整的原始資料，並等待回傳
    const patient = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;                 
    //typeof res.body === 'string' = 檢查包裝，
    // 意思是：我們先用 typeof 這個放大鏡，去檢查從網路拿到的 res.body（資料箱）到底是什麼材質。
    // 目的：看看它現在是被打包成「一長串死板板的純文字字串」（'string'），還是已經被自動處理成「活生生、可以直接修改的物件」（'object'）。
    //JSON.parse(res.body)
    // 條件成立（是字串）：執行 JSON.parse(res.body)情境：如果檢查結果發現「對，它現在是一串死板板的文字」。
    // 動作：程式就會啟用 JSON.parse() 這把美工刀，把這串文字拆封、解鎖，轉換成 JavaScript 看得懂、而且可以自由修改欄位的「活物件」。
    //res.body;
    //條件不成立（不是字串）：直接拿 res.body情境：如果檢查結果發現「它本來就已經是解封好的物件了」。
    // 動作：程式就完全不動刀，直接把 res.body 原封不動地拿過來用，避免重複拆封導致程式出錯。
    if( family || given ){                                                                          //如果使用者有輸入姓氏（family）或名字（given）
        if(!patient.name || !patient.given === 0){                                                  //防禦機制：檢查原始資料中是否有缺漏 name 欄位或 name 陣列內沒內容
        patient.name = [{"use" : "official" ,"family":"","given":[""]}]                             //若結構損壞，則初始化一個標準的官方姓名物件結構給它（防錯處理）
    }
    if(family)patient.name[0].family = family ;                                                     // 如果這次有輸入新姓氏，就覆蓋掉原始資料中第一組姓名的 family 欄位
    if(given)patient.name[0].given = [given] ;                                                      //如果這次有輸入新名字，就覆蓋掉原始資料中第一組姓名的 given 欄位
    }
    if (birthDate) {                                                                                // 如果使用者有輸入新生日
        patient.birthDate = birthDate;                                                              // 直接覆蓋或寫入 FHIR 規格的 birthDate 欄位
    }
    if( phone || email){                                                                            //如果使用者有輸入新電話或新電子郵件
        if(!patient.telecom)patient.telecom = [];                                                   //檢查原始資料中若完全沒有聯絡方式（telecom）欄位，就初始化為空陣列
        if(phone){                                                                                  //如果有輸入新電話
            const phoneObject = patient.telecom.find(t => t.system === "phone");                    //從原本的聯絡陣列中，尋找系統類別為 "phone" 的第一筆既有電話物件
            if(phoneObject){                                                                        //如果原本就存在電話物件
                phoneObject.value = phone ;                                                         //直接把舊電話的數值（value）修改為新輸入的電話
            }else{                                                                                  //如果原本的資料裡面根本沒有電話物件
                patient.telecom.push({"system" : "phone" , "value" : phone , "use" : "mobile"});    //建立一個全新的電話物件並推入（push）到聯絡陣列中
            }
        }
        if(email){                                                                                  //如果有輸入新電子郵件
            const emailObject = patient.telecom.find(t => t.system === "email");                    //從原本的聯絡陣列中，尋找系統類別為 "email" 的第一筆既有郵件物件
            if(emailObject){                                                                        //如果原本就存在郵件物件
                emailObject.value = email ;                                                         //直接把舊郵件的數值（value）修改為新輸入的電子郵件
            }else{                                                                                  //如果原本的資料裡面根本沒有郵件物件
                patient.telecom.push({"system" : "email" , "value" : email });                      //建立一個全新的郵件物件並推入（push）到聯絡陣列中
            }
        }
    }
    const updateRes = await putFHIR ("/Patient/" + id,patient);                                     //呼叫 putFHIR 函式發送 PUT 請求更新伺服器資料，並等待回傳更新後的完整物件
    alert ("更新患者資料成功" + updateRes.id);                                                        //彈出提示視窗，告知使用者更新成功，並顯示更新後的病歷號 ID
}

document.getElementById("updateButton").addEventListener("click",async()=>{                         //「更新按鈕」綁定點擊事件，因內部有非同步的 API 操作，使用 async 箭頭函式
    const id = document.getElementById("updatePatientId").value.trim();                             //取得要修改的「病歷號」，並清除前後多餘的空格
    const family = document.getElementById("patientFamily").value.trim();                           //取得新輸入的「姓氏」，並清除前後多餘的空格
    const given = document.getElementById("patientGiven").value.trim();                             //取得新輸入的「名字」，並清除前後多餘的空格
    const birthDate = document.getElementById("patientBirthdate").value.trim();                     //取得新輸入的「生日」，並清除前後多餘的空格
    const phone = document.getElementById("telecomPhone").value.trim();                             //取得新輸入的「電話號碼」，並清除前後多餘的空格
    const email = document.getElementById("telecomEmail").value.trim();                             //取得新輸入的「電子信箱」，並清除前後多餘的空格

    if(!id){                                                                                        //【第一重驗證】檢查使用者是否「沒有輸入」病歷號
        alert("請輸入病歷號");                                                                       //若沒輸入，跳出提示視窗要求使用者補填
        return;                                                                                     //中斷程式執行，不繼續往下運作
    }
    if(!family && !given && !birthDate && !phone && !email){                                        //第二重驗證】檢查是否「所有修改欄位都空著」（姓名、生日、手機、信箱通通沒填）
        alert ("請輸入要更改的資料(姓名、生日、手機、電子信箱)");                                       //若全部都是空的，跳出提示視窗要求使用者至少填寫一項要更改的資料
        return;                                                                                     //中斷程式執行，不繼續往下運作
    }

    try{                                                                                            //開始執行 try 區塊（若呼叫更新或處理過程中出錯，會跳到 catch 區塊）
        await updatePatientData (id,family,given,birthDate,phone,email);                            //呼叫先前定義的 updatePatientData 函式，將帶入的各項新資料非同步送出並等待完成
        alert ("更新患者資料成功，請重新查詢。");                                                      //彈出提示視窗，告知使用者更新成功並提醒重新查詢以刷新畫面
        document.getElementById("updatePatientId").value =                                          //成功後清空「更新病歷號」輸入框的內容
        document.getElementById("patientFamily").value =                                            //成功後清空「姓氏」輸入框的內容
        document.getElementById("patientGiven").value =                                             //成功後清空「名字」輸入框的內容
        document.getElementById("patientBirthdate").value =                                         //成功後清空「生日」輸入框的內容
        document.getElementById("telecomPhone").value =                                             //成功後清空「手機號碼」輸入框的內容
        document.getElementById("telecomEmail").value =                                             //成功後清空「電子信箱」輸入框的內容
        document.getElementById("result").textContent = "" ;                                        //將網頁上用來顯示 JSON 結果的 "result" 元素內容清空
        document.getElementById("searchPatientId").focus();                                         //將網頁焦點（游標）自動移回「主畫面查詢輸入框」，方便使用者直接重新查詢
    }catch(error){                                                                                  //捕捉並處理 try 區塊中發生的任何錯誤（例如：網路斷線、伺服器找不到該 ID 等）
        alert ("更新失敗，請確認ID是否正確，或聯絡資訊室進行排除。")                                    //彈出失敗警示視窗，提示可能的錯誤原因（如 ID 錯誤）或聯繫內部資訊室處理
    }
});