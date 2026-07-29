const deletebase = "https://hapi.fhir.org/baseR4";                                //定義 FHIR 伺服器的基礎 API 網址

async function getFHIR(path){                                                 //獲取 FHIR 病歷號
    const res = await fetch(deletebase + path)
    return {status : res.status , body : await res.text()};
}
async function deleteFHIR(path){                                              //刪除 FHIR 病歷號
    const res = await fetch (deletebase + path ,{method : "DELETE"});
    return {status : res.status , body : await res.text()};
}
async function deletePatientId(id){
    const preCheck = await getFHIR ("/Patient/" + id);                        //刪除病歷號前先GET確認有無病歷號
    if (preCheck.status === 404){
        alert("請輸入正確病歷號");
        return;
    }
    const del = await deleteFHIR("/Patient/" + id);                           //刪除
    const check = await getFHIR ("/Patient/" + id);                           //驗證
    alert(`刪除病歷號完成，DELETE狀態碼：${del.status}，刪除後 GET 狀態碼${check.status}`);
}
document.getElementById("deleteButton").addEventListener("click" , async()=>{
    const id = document.getElementById("searchPatientId").value.trim();

    if(!id){
        alert("請輸入病歷號");
        return;
    }
    try{
        await deletePatientId(id);
    } catch(error){
        alert ("刪除病歷號失敗!!");
    }
});

