// 获取需要的node模块
let { ipcRenderer } = require('electron')

// 使用require引入jquery从而解决使用scrip标签引入jquery产生的冲突
window.$ = window.jQuery = require('../static/js/jquery3.6.3.js')

//定义相关的全局变量
//进度条的进度值，百分比形式
let progressnum = null
//音乐播放器中音乐现在播放的时长
let starttime = null
//音乐播放器中音乐的时长
let endtime = 95
//音乐播放器的src资源
let playersrc= null
//获取html页面中的音乐播放器存到javascript的全局变量中
let player = $("#player")[0]
//音乐的播放器中音乐名字
let songname = null
// 音乐作者的名字
let username = null
// 用户是否自己调整过音量
let isvol = false

// 计算音频的时长
const countAudioTime = async () => {
    while (isNaN(player.duration) || player.duration === Infinity) {
        // 延迟一会 不然网页都卡死
        await new Promise(resolve => setTimeout(resolve, 200));
        // 设置随机播放时间，模拟调进度条
        player.currentTime = 10000000 * Math.random();
    }
    // 将获的音频时长传给全局变量endtime保存
    endtime = Math.floor(player.duration)
    // 将时长转化成 “00:00” 的形式渲染到渲染进程上
    $(".endtime").text( "0" + Math.floor(endtime/60) + ":" + (endtime%60>10 ? endtime%60 : "0"+endtime%60))
    // 重置player的currenTime
    player.currentTime = 0
}

// 当用户想要最小化app时传给主进程最小化app
$(".miniicon").click(function(){
    ipcRenderer.send("window-mini")
})

// 当用户想要退出应用时弹出关闭提示，提示用户是退出app还是最小化到系统托盘
$(".tuichuicon").click(function(){
    $(".close-reminder").show()
})

// 隐藏我们的关闭提示
$(".close-reminder .close-icon").click(function(){
    $(".close-reminder").hide()
})

// 获取用户是想要退出app还是隐藏到托盘并且执行该操作
$(".close-reminder .close-check").click(function(){
    ipcRenderer.send($("input[type='radio']:checked").val())
    $(".close-reminder").hide()
})

// 拖拽进度条时改变player的currentTime值并且改变进度条的进度
$(".progress").mousedown(function(e){
    progressnum = (e.pageX-435) / 330 * 100
    progressnum = progressnum + '%'
    $(".progress-bar").css("width",progressnum)
    player.currentTime = (e.pageX-435) / 330 * endtime
})

// 点击播放或者暂停按钮时暂停或者播放
$(".toggle").click(function(){
    if(player.paused){
        player.play()
        $(this).attr("src" , "../static/image/zhanting.png")
        if(!isvol){
            player.volume = 0.5
        }
    }else{
        player.pause()
        $(this).attr("src" , "../static/image/bofang.png")
    }
})

// 播放或者进度变化时对左边的时间和进度条进行改变
player.ontimeupdate = function(){
    starttime = Math.floor(player.currentTime)
    $(".progress-bar").css("width",starttime/endtime*100 + '%')
    starttime = "0" + Math.floor(starttime/60) + ":" + (starttime%60 > 10 ? starttime%60 : '0' + starttime%60)
    $(".starttime").text(starttime)
}

// 点击音乐资源时，在下方的音乐的播放器中加载音乐的信息
$(".start").click(function(){
    $(".starttime").text("00:00")
    playersrc = $(this).attr("src")
    username = playersrc.slice(playersrc.lastIndexOf("/")+1,playersrc.lastIndexOf("-"))
    $("#player").attr("src" , ((playersrc.slice(0,playersrc.lastIndexOf(".")) + ".mp3").replace("image","audio")).replace(username+'-',''))
    countAudioTime()
    songname = (playersrc.substring(playersrc.lastIndexOf("/")+1,playersrc.lastIndexOf("."))).replace(username+"-",'')
    $(".song-name").text(songname)
    $(".musicname img").attr("src",playersrc)
    $(".user-name").text(username)
    $(".toggle").attr("src" , "../static/image/bofang.png")
})

// 优化用户点击当前页面出现页面闪烁的问题
$(".bg-secondary a").click(function(e){
    e.preventDefault();
})

// 显示和隐藏音量条
$(".yinliangcontrol").click(function(){
    if($(".myprogress").css("width") != "100px" ){
        $(".myprogress").css("width","100px")
        $(".myprogressbar").css("width", "50%")
        player.volume = 0.5
    }else{
        $(".myprogress").css("width","0px")
    }
})

// 点击音量长度条改变音量大小
$(".myprogress").click(function(e){
    $(".myprogressbar").css("width",(e.pageX-1048) + '%')
    player.volume = (e.pageX-1048)/100
    isvol = true
})

// 显示和隐藏歌单
$(".gedan").click(function(){
    $(".liebiao").slideToggle("slow")
})