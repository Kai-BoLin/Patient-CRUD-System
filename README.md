# 患者管理系統 (FHIR Patient CRUD System)

本專案為對接外部 HAPI FHIR 伺服器之臨床病人資料管理前端系統。具備完整的資料維護功能，並依循軟體開發模組化規範編寫。

## 🛠️ 使用技術
- HTML5 / CSS3 表單控制與基礎版面配置 
- 原生 JavaScript (ES6+)
- RESTful API 串接 (非同步 Fetch / Ajax 操作)

## 🌟 核心功能
- **Create (新增)**：將前端表單輸入之患者資料封裝為標準 FHIR Patient Resource 格式並上傳。
- **Read / Search (查詢)**：串接 HAPI FHIR 伺服器，依據患者病歷號撈取並顯示患者資料。
- **Update (修改)**：對接 Patient ID，進行臨床資料欄位之更改與上傳伺服器後同步更新。
- **Delete (刪除)**：實作臨床資料的非同步刪除請求維護。
