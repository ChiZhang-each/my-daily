// 全局变量
let articleList = JSON.parse(localStorage.getItem("dailyData")) || [];
const articleListDom = document.getElementById("articleList");
const submitBtn = document.getElementById("submitBtn");
const modeBtn = document.getElementById("modeBtn");
const monthArchiveDom = document.getElementById("monthArchive");
const clearAllBtn = document.getElementById("clearAllBtn");

// 深色浅色模式
if(localStorage.getItem("darkMode") === "true"){
    document.body.classList.add("dark");
    modeBtn.textContent = "☀️ 浅色模式";
}
modeBtn.addEventListener("click", ()=>{
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    modeBtn.textContent = isDark ? "☀️ 浅色模式" : "🌙 深色模式";
    localStorage.setItem("darkMode", isDark);
})

// 一键清空所有数据
clearAllBtn.addEventListener("click", ()=>{
    if(window.confirm("确定要删除所有日常记录吗？删除后无法恢复！")){
        localStorage.removeItem("dailyData");
        articleList = [];
        renderArticles();
        alert("全部数据已清空");
    }
})

// 日期格式化函数
function formatDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth()+1).padStart(2,"0");
    const day = String(now.getDate()).padStart(2,"0");
    const hour = String(now.getHours()).padStart(2,"0");
    const min = String(now.getMinutes()).padStart(2,"0");
    return {
        full: `${year}-${month}-${day} ${hour}:${min}`,
        monthKey: `${year}-${month}`
    }
}

// 渲染所有动态卡片
function renderArticles() {
    articleListDom.innerHTML = "";
    articleList.sort((a,b)=> b.timeStamp - a.timeStamp).forEach((item, index)=>{
        let imgHtml = "";
        if(item.imgSrc) imgHtml = `< img src="${item.imgSrc}" class="card-img">`;
        let commentHtml = "";
        item.comments.forEach(comm=>{
            commentHtml += `<div class="comment-item">· ${comm}</div>`
        })

        const cardDom = `
            <div class="article-card" data-month="${item.monthKey}" data-index="${index}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <h3>${item.title} <span class="mood-tag">${item.mood}</span></h3>
                    <button class="del-btn" data-card-index="${index}">🗑 删除本条</button>
                </div>
                <p>${item.content}</p >
                ${imgHtml}
                <div class="time">发布时间：${item.time}</div>
                <div class="comment-area">
                    <div>留言区</div>
                    ${commentHtml}
                    <input class="comment-input" placeholder="写下留言..." data-card-index="${index}">
                    <button class="send-comment" data-card-index="${index}">发送留言</button>
                </div>
            </div>
        `
        articleListDom.innerHTML += cardDom;
    })
    bindCommentEvent();
    bindDeleteEvent();
    renderArchive();
}

// 绑定留言发送
function bindCommentEvent(){
    document.querySelectorAll(".send-comment").forEach(btn=>{
        btn.onclick = function(){
            const idx = this.dataset.cardIndex;
            const inputDom = document.querySelector(`.comment-input[data-card-index="${idx}"]`);
            const text = inputDom.value.trim();
            if(!text) return alert("留言不能为空");
            articleList[idx].comments.push(text);
            saveData();
            renderArticles();
        }
    })
}

// 绑定单条删除按钮
function bindDeleteEvent() {
    document.querySelectorAll(".del-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const idx = Number(this.dataset.cardIndex);
            const sure = window.confirm("确定删除这条日常记录？");
            if (sure) {
                articleList.splice(idx, 1);
                saveData();
                renderArticles();
            }
        })
    })
}

// 渲染月份归档列表
function renderArchive(){
    monthArchiveDom.innerHTML = "";
    const monthSet = new Set();
    articleList.forEach(item=> monthSet.add(item.monthKey));
    const monthArr = Array.from(monthSet).sort().reverse();
    monthArr.forEach(month=>{
        const li = document.createElement("li");
        li.textContent = month;
        li.onclick = ()=>{
            document.querySelectorAll(".article-card").forEach(card=>{
                if(card.dataset.month === month) card.style.display = "block";
                else card.style.display = "none";
            })
        }
        monthArchiveDom.appendChild(li);
    })
}

// 数据保存到本地存储
function saveData(){
    localStorage.setItem("dailyData", JSON.stringify(articleList));
}

// 发布日常点击事件
submitBtn.addEventListener("click", function(){
    const title = document.getElementById("articleTitle").value.trim();
    const content = document.getElementById("articleContent").value.trim();
    const mood = document.querySelector('input[name="mood"]:checked').value;
    const imgFile = document.getElementById("imgUpload").files[0];
    if(!title || !content){
        return alert("标题和内容不能为空！");
    }

    const dateObj = formatDate();
    const articleObj = {
        title,
        content,
        mood,
        time: dateObj.full,
        monthKey: dateObj.monthKey,
        timeStamp: Date.now(),
        imgSrc: "",
        comments: []
    }

    if(imgFile){
        const reader = new FileReader();
        reader.readAsDataURL(imgFile);
        reader.onload = function(e){
            articleObj.imgSrc = e.target.result;
            pushArticleAndRefresh(articleObj);
        }
    }else{
        pushArticleAndRefresh(articleObj);
    }
})

// 新增数据刷新页面
function pushArticleAndRefresh(obj){
    articleList.push(obj);
    saveData();
    document.getElementById("articleTitle").value = "";
    document.getElementById("articleContent").value = "";
    document.getElementById("imgUpload").value = "";
    renderArticles();
    alert("发布成功！");
}

// 页面初始化加载数据
renderArticles();