const createbase = "https://hapi.fhir.org/baseR4" ;                                //定義 FHIR 伺服器的基礎 API 網址

const dialog = document.getElementById("createPatient");                        //取得網頁中的彈出對話視窗元素（通常是 HTML 的 <dialog> 標籤）
const openButton = document.getElementById("newPatient");                       //取得「打開彈窗」的按鈕元素（例如：新增病人按鈕）
const submitButton = document.getElementById("submitCreateButton");             //取得彈窗內「確認送出」的按鈕元素
const closeButton = document.getElementById("closeModalButton");                //取得彈窗內「關閉視窗」的按鈕元素
//「打開按鈕」綁定點擊事件，當點擊時執行箭頭函式
openButton.addEventListener("click",()=>{                                       //點擊主畫面「新增患者資料」 -> 彈出視窗
    dialog.showModal();                                                         //呼叫 showModal() 方法，以互動視窗（Modal）形式打開對話框
});
//「關閉按鈕」綁定點擊事件，當點擊時執行箭頭函式
closeButton.addEventListener("click",()=>{                                      //點擊主畫面「取消建立」-> 關閉視窗
    dialog.close();                                                             //呼叫 close() 方法，關閉對話框並隱藏視窗
});

//Post請求函式：定義一個非同步函式，傳入 API 路徑與要新增的資料物件
async function postFHIR(path,data){                                             
    const res = await fetch(createbase + path , {                               //使用 fetch 發送非同步請求，拼接完整的 API 網址，並設定請求設定
        method : "POST",                                                        //用POST建立資料：設定 HTTP 方法為 POST，告訴伺服器這是新增資料
        headers : {"Content-Type" : "application/json"},                        //設定 HTTP 請求標頭，指定發送的內容格式為 JSON 資料
        body : JSON.stringify(data)                                             //將 JavaScript 資料物件轉成 JSON 字串，放入請求體（Body）中送出
    });
    if(!res.ok)                                                                 //檢查伺服器回應是否失敗（HTTP 狀態碼非 200~299 區間）
    throw new Error("建立患者失敗，請重新建立" + res.status);                     //如果失敗，拋出錯誤訊息並串接該 HTTP 狀態碼
    return await res.json();                                                    //等待將伺服器回傳的回應體解析為 JSON 物件，並將其結果回傳
}

//點擊「確定建立」按鈕事件監聽：為確認按鈕綁定點擊事件，因為內有非同步操作，使用 async 函式
submitButton.addEventListener("click",async() => {
    //抓取彈出格子內輸入的內容
    const family = document.getElementById("newFamily").value.trim();           //取得輸入的「姓氏」，並去除前後空格
    const given = document.getElementById("newGiven").value.trim();             //取得輸入的「名字」，並去除前後空格
    const gender = document.getElementById("newGender").value.trim();           //取得選取的「性別」欄位值
    const birthDate = document.getElementById("newBirthdate").value.trim();     //取得填寫的「出生日期」值
    const phone = document.getElementById("newPhone").value.trim();             //取得輸入的「電話號碼」，並去除前後空格
    const email = document.getElementById("newEmail").value.trim();             //取得輸入的「電子郵件」，並去除前後空格
    //欄位防禦：至少要選擇性別及輸入姓名才可以建立
    if (!family || !given || !gender){                                          //檢查是否有填寫姓名並選擇性別
        alert("請輸入患者名字並選擇性別，未知姓名，請於姓填寫無名氏，名為男/女");     //若未填寫姓名及選擇性別，彈出警示視窗提示使用者選擇
        return;                                                                 //中斷函式執行，不繼續往下送出
    }
    //依照FHIR規格封裝資料
    const newPatient = {                                                        //建立一個名為 newPatient 的物件，結構必須完全符合 FHIR Patient Resource 規範
        "resourceType" : "Patient",                                             //指定 FHIR 資源類型為 Patient（病人）
        "active" : true,                                                        //設定該病歷狀態為啟用中
        "name" : [                                                              //姓名欄位（FHIR 規範為陣列形式）
            {
                "use" : "official",                                             //指定此姓名用途為「官方/正式姓名」
                "family" : family,                                              //填入剛才抓取的姓氏
                "given" : [given]                                               //填入名字（FHIR 規範的名是字串陣列，所以加上中括號）
            }
        ],
        "telecom" : [],                                                         //聯絡方式以陣列形式：預設為空陣列
        "gender" : gender ? gender : undefined,                                 //判斷是否有填性別，有填就帶入，沒填則設為 undefined（FHIR 欄位若為 undefined 送出時會被自動忽略)
        "birthDate" : birthDate ? birthDate : undefined                         //判斷是否有填生日，有填就帶入，沒填則設為 undefined
    };
    //如果有填寫聯絡方式才放進資料中
    if (phone) newPatient.telecom.push({"system" : "phone" , "value" : phone , "use" : "mobile"});
    //如果 phone 變數有值，就將電話物件推入（push）到 telecom 陣列中
    if (email) newPatient.telecom.push({"system" : "email" , "value" : email });//如果 email 變數有值，就將郵件物件推入（push）到 telecom 陣列中

    try {                                                                       //開始執行 try 區塊（若發送 API 或後續處理出錯，會跳到 catch 區塊）
        const createData = await postFHIR ("/Patient" , newPatient);            //發送到POST，請求到/Patient ->請伺服器自己生成一個P't ID：呼叫 postFHIR 函式，並等待伺服器回傳新建的病人資料
        alert ("新患者建立成功，病歷號為： " + createData.id);                    //彈出提示視窗，告知使用者建立成功，並顯示伺服器自動生成的病歷號（ID）
        dialog.close();                                                         //建立成功後自動彈出視窗關掉：呼叫 close() 方法把輸入表單的對話框關閉
        document.getElementById("searchPatientId").value = createData.id;       //自動將新產生的病歷號填入主畫面的「查詢輸入框」中，方便使用者直接查詢
        document.getElementById("updatePatientId").value = createData.id;       //自動將新產生的病歷號填入「更新輸入框」中（為後續的修改功能做準備）
        document.getElementById("result").textContent = JSON.stringify(createData,null,2);  //將伺服器回傳的完整 FHIR 資源物件轉成漂亮的 JSON 字串
        if (typeof handleClick === "function"){                                 //檢查是否有定義 `handleClick` 這個函式（檢查其型態是否為 function）
            handleClick();                                                      //如果有此函式，就直接主動呼叫它，讓畫面自動執行一次查詢以重新整理
        }
    }catch(error){                                                              //捕捉在 try 區塊中發生的任何錯誤（例如網路斷線、伺服器報錯等）
        alert("建立新患者失敗，請查明原因： " + error.message);                   //彈出提示視窗，顯示具體的建立失敗原因
    }
});
