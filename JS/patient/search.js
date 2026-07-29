const base = "https://hapi.fhir.org/baseR4" ;                                     //定義 FHIR 伺服器的基礎 API 網址

async function fetchPatient(url){                                              //定義一個非同步函式，傳入網址參數來獲取病人資料
    const res = await fetch (url,{                                             //使用 fetch 發送非同步請求，並等待伺服器回應
        headers : { 'Accept' : 'application/json' }                            //設定 HTTP 請求標頭，指定接收 JSON 格式的資料
    });

    if(!res.ok){                                                               //檢查伺服器回應是否失敗（HTTP 狀態碼不是 200~299）
        throw new Error("查無此病歷號，請重新輸入",res.status);                  //如果失敗，拋出錯誤訊息與該 HTTP 狀態碼
    }
    const data = await res.json();                                             //等待並將Response body解析為 JavaScript 物件/JSON
    showPatientData(data);                                                     //呼叫畫面渲染函式，將解析後的病人資料傳入並顯示
    return data;                                                               //回傳解析後的資料物件，供後續程式碼呼叫使用
}

function showPatientData(patient){                                             //定義一個叫做showPatientData函式來處理解析並顯示病人資料
    const id = patient.id ?? "";                                               //取得病人識別碼，若不存在則給予空字串（使用空值合併運算子 ??）
    const gender = patient.gender ?? "";                                       //取得病人性別，若不存在則給予空字串
    const birthDate = patient.birthDate ?? "";                                 //取得病人出生日期，若不存在則給予空字串
    let name = "";                                                             //宣告變數儲存完整姓名，預設為空字串
    let phone= "";                                                             //宣告變數儲存電話號碼，預設為空字串
    let email= "";                                                             //宣告變數儲存電子郵件，預設為空字串
    if (patient.name && patient.name.length > 0)                               //檢查病人姓名陣列是否存在，且長度大於 0
    {
        const n = patient.name [0] ;                                           //取得姓名陣列中的第一筆姓名資料物件
        const family = n.family ? n.family : "";                               //取得姓氏（family），若不存在則給予空字串
        let given = "";                                                        //宣告變數儲存名（given），預設為空字串
        if (n.given && n.given.length > 0){                                    //檢查名（given）陣列是否存在，且長度大於 0（FHIR 的名是陣列）
            given = n.given.join(" ");                                         //將陣列中的多個名，用空字串連接起來
        }
        name = (family + " " +given).trim();                                   //將姓與名拼接，並清除前後的多餘空格，回傳給 name 變數 (第20行)
    }
    if (patient.telecom && patient.telecom.length > 0)                         //檢查聯絡方式（telecom）陣列是否存在，且長度大於 0 (觀念同第23行)
    {
        const phoneObject = patient.telecom.find (t => t.system === "phone");  //從聯絡陣列中，尋找系統類別（system）為 "phone" 的第一筆電話物件
        if (phoneObject) phone = phoneObject.value ?? "" ;                     //如果有找到電話物件，則取得其數值（value），若無則給空字串
        const emailObject = patient.telecom.find(t => t.system === "email");   //從聯絡陣列中，尋找系統類別（system）為 "email" 的第一筆電子郵件物件
        if (emailObject) email = emailObject.value ?? "" ;                     //如果有找到郵件物件，則取得其數值（value），若無則給空字串
    }

    const parsed ={                                                            //將前面提取出來的病人欄位資料，封裝成一個名為 parsed(已解析) 的物件
        id,                                                                    //病人識別碼（使用 ES6 屬性簡寫語法，等同於 id: id）
        name,                                                                  //拼接後的病人完整姓名
        gender,                                                                //病人性別
        birthDate,                                                             //病人出生日期
        phone,                                                                 //篩選出的電話號碼
        email                                                                  //篩選出的電子郵件
    };
    const keyMapping = {                                                       //  建立中英對照表
        id: "患者病歷號",
        name: "姓名",
        gender: "性別",
        birthDate: "生日",
        phone: "聯絡方式-手機",
        email: "聯絡方式-電子郵件"
    };

    const chineseParsed = {};                                                  //複製一份專門轉成中文的物件
    for (const key in parsed) {
        if (parsed.hasOwnProperty(key)) {
            let value = parsed[key];
            if (key === 'gender') {                                           // 把性別的 male / female 也換成中文
                if (value === 'male') value = '男';
                if (value === 'female') value = '女';
            }
            const chineseKey = keyMapping[key] || key;
            chineseParsed[chineseKey] = value;
        }
    }
    const jsonString = JSON.stringify(chineseParsed, null, 2);                 //將物件轉換為標準的縮排字串
    const cleanJson = jsonString.replace(/^\{\n?|\n?\}$/g, '');                //利用正則表達式，把開頭的 { 和結尾的 }（包含換行）給去掉
    document.getElementById("result").textContent = cleanJson;                 //尋找網頁中 ID 為 "result" 的 HTML 元素 = cleanJson
}

async function handleClick(){                                                   //定義一個非同步函式處理點擊事件
    try{                                                                        //開始執行 try 區塊（若區塊內出錯，會跳到 catch 區塊）
        const id = document.getElementById('searchPatientId').value.trim();     //獲取輸入框內的使用者輸入，並去除前後多餘的空格
        if(!id) return alert ("請輸入正確病歷號");                               //檢查是否未輸入內容，若是則跳出提示視窗並直接結束函式
        const url =`${base}/Patient/${encodeURIComponent(id)}`;                 //使用字串模版拼接出符合 FHIR 標準的完整病人查詢 URL（並將 ID 進行網址編碼防錯）
        const patientData = await fetchPatient(url);                            //呼叫先前定義的 fetchPatient 函式獲取伺服器資料，並等待其回傳
        showPatientData(patientData);                                           //呼叫先前定義的 showPatientData 函式將資料顯示在網頁上
    }catch(error){                                                              
        console.log("查無此病例號",error);                                       //捕捉並處理 try 區塊內發生或被拋出（throw）的任何錯誤
        alert (error.message);                                                  //在開發者控制台（Console）輸出錯誤訊息紀錄
        document.getElementById('result').textContent = error ;                 //將網頁上 ID 為 "result" 的元素內容替換為錯誤訊息
    }
}
document.getElementById("searchButton").addEventListener("click",handleClick);  //網頁中的「搜尋按鈕」綁定點擊事件，當點擊時執行 handleClick 函式
