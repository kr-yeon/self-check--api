const express = require('express');
const request = require('sync-request');
const JSEncrypt = require('node-jsencrypt');
const app = express();
const crypto=new JSEncrypt();
crypto.setPublicKey("MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA81dCnCKt0NVH7j5Oh2+SGgEU0aqi5u6sYXemouJWXOlZO3jqDsHYM1qfEjVvCOmeoMNFXYSXdNhflU7mjWP8jWUmkYIQ8o3FGqMzsMTNxr+bAp0cULWu9eYmycjJwWIxxB7vUwvpEUNicgW7v5nCwmF5HS33Hmn7yDzcfjfBs99K5xJEppHG0qc+q3YXxxPpwZNIRFn0Wtxt0Muh1U8avvWyw03uQ/wMBnzhwUC8T4G5NclLEWzOQExbQ4oDlZBv8BM/WxxuOyu0I8bDUDdutJOfREYRZBlazFHvRKNNQQD2qDfjRz484uFs7b5nykjaMB9k/EJAuHjJzGs9MMMWtQIDAQAB");
const localnum={
    "서울":"01",
    "부산":"02",
    "대구":"03",
    "인천":"04",
    "광주":"05",
    "대전":"06",
    "울산":"07",
    "세종":"08",
    "경기":"10",
    "강원":"11",
    "충북":"12",
    "충남":"13",
    "전북":"14",
    "전남":"15",
    "경북":"16",
    "경남":"17",
    "제주":"18"
};
const scnum={
    "유치원":"1",
    "초등학교":"2",
    "중학교":"3",
    "고등학교":"4",
    "특수학교":"5"
};
const locuri={
    "서울":"https://senhcs.eduro.go.kr/",
    "부산":"https://penhcs.eduro.go.kr/",
    "대구":"https://dgehcs.eduro.go.kr/",
    "인천":"https://icehcs.eduro.go.kr/",
    "광주":"https://genhcs.eduro.go.kr/",
    "대전":"https://djehcs.eduro.go.kr/",
    "울산":"https://usehcs.eduro.go.kr/",
    "세종":"https://sjehcs.eduro.go.kr/",
    "경기":"https://goehcs.eduro.go.kr/",
    "강원":"https://kwehcs.eduro.go.kr/",
    "충북":"https://cbehcs.eduro.go.kr/",
    "충남":"https://cnehcs.eduro.go.kr/",
    "전북":"https://jbehcs.eduro.go.kr/",
    "전남":"https://jnehcs.eduro.go.kr/",
    "경북":"https://gbehcs.eduro.go.kr/",
    "경남":"https://gnehcs.eduro.go.kr/",
    "제주":"https://jjehcs.eduro.go.kr/"
}

function getsc(local, sctype, scname) {
    try{
        let res=request("GET", `https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=${encodeURIComponent(localnum[local])}&schulCrseScCode=${encodeURIComponent(scnum[sctype])}&orgName=${encodeURIComponent(scname)}&loginType=school`);
        return JSON.parse(res.getBody("UTF-8"))["schulList"][0]["orgCode"];
    } catch(e) {
        return {status:4, message:"local(지역), sctype(학교종류), scname(학교이름)값을 다시 확인해주세요."};
    }
}

function finduser(local, orgCode, name, birthday) {
    let res=request("POST", `${locuri[local]}v2/findUser`, {
        "json":{
            "birthday":encrypt(birthday),
            "loginType":"school",
            "name":encrypt(name),
            "orgCode":orgCode,
            "stdntPNo":null
        }
    });
    return JSON.parse(res.body.toString("UTF-8"));
}

function haspass(local, token) {
    let res=request("POST", `${locuri[local]}v2/hasPassword`, {
        "headers":{
            "Authorization":token
        },
        "json":{}
    });
    return JSON.parse(res.getBody("UTF-8"));
}

function wrtiepass(local, token, pass) {
    let res=request("POST", `${locuri[local]}v2/validatePassword`, {
        "headers":{
            "Authorization":token
        },
        "json":{
            "password":encrypt(pass),
            "deviceUuid":""
        }
    });
    return JSON.parse(res.getBody("UTF-8"));
}

function selectugrp(local, token) {
    let res=request("POST", `${locuri[local]}v2/selectUserGroup`, {
        "headers":{
            "Authorization":token
        },
        "json":{}
    });
    return JSON.parse(res.getBody("UTF-8"));
}

function registerservey(local, duuid, token, name, answer) {
    let res=request("POST", `${locuri[local]}registerServey`, {
        "headers":{
            "Authorization":token
        },
        "json":{
            "rspns00":"Y",
            "rspns01":String(answer[0]+1),
            "rspns02":String(eval("1^"+answer[1])),
            "rspns03":null,
            "rspns04":null,
            "rspns05":null,
            "rspns06":null,
            "rspns07":null,
            "rspns08":null,
            "rspns09":String(answer[2]),
            "rspns10":null,
            "rspns11":null,
            "rspns12":null,
            "rspns13":null,
            "rspns14":null,
            "rspns15":null,
            "deviceUuid":duuid,
            "upperToken":token,
            "upperUserNameEncpt":name
        }
    });
    return JSON.parse(res.getBody("UTF-8"));
}

function getuserinfo(local, orgCode, userPNo, token) {
    let res=request("POST", `${locuri[local]}v2/getUserInfo`, {
        "headers":{
            "Authorization":token
        },
        "json":{
            "orgCode":orgCode,
            "userPNo":userPNo
        }
    });
    return JSON.parse(res.getBody("UTF-8"));
}

function encrypt(text) {
    return crypto.encrypt(text);
}

function isarray(text) {
    try{
        return Array.isArray(JSON.parse(text));
    } catch(e) {
        return false;
    }
}

app.get('/', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let local=req.query.local;
    let sctype=req.query.sctype;
    let scname=req.query.scname;
    let name=req.query.name;
    let birthday=req.query.birth;
    let password=req.query.pass;
    let answer=req.query.answer;
    if(local==null) res.json({status:1, message:`local(지역)값을 설정해주세요.\n목록:${Object.keys(localnum)}`});
    else if(sctype==null) res.json({status:1, message:`sctype(학교종류)값을 설정해주세요.\n목록:${Object.keys(scnum)}`});
    else if(scname==null) res.json({status:1, message:`scname(학교이름)값을 설정해주세요.`});
    else if(name==null) res.json({status:1, message:`name(이름)값을 설정해주세요.`});
    else if(birthday==null) res.json({status:1, message:`birth(생일)값을 설정해주세요. (YYMMDD)`});
    else if(password==null) res.json({status:1, message:`pass(비밀번호)값을 설정해주세요.`});
    else if(!Object.keys(localnum).includes(local)) res.json({status:2, message:`local(지역)값을 확인해주세요.\n목록:${Object.keys(localnum)}`});
    else if(!Object.keys(scnum).includes(sctype)) res.json({status:2, message:`sctype(학교종류)값을 확인해주세요.\n목록:${Object.keys(scnum)}`});
    else if(birthday.length != 6 && birthday.length != 8) res.json({status:2, message:`birth(생일)값을 6자리로 설정해주세요. (YYMMDD)`});
    else if(answer != null && !isarray(answer)) res.json({status:2, message:`answer(답)값을 확인해주세요. 배열 행태로 들어가야 합니다.(0:아니오, 1:네)\n예시:[0,0,0]`});
    else if(answer != null && JSON.parse(answer).length != 3) res.json({status:2, message:`answer(답)의 갯수는 3개여야 합니다.`});
    else if(answer != null && JSON.parse(answer).filter(s=>s!==0).filter(s=>s!==1).length != 0) res.json({status:2, message:`answer(답)값을 수정해주세요. 0과 1밖에 들어갈 수 없습니다.(0:아니오, 1:네)\n예시:[0,0,0]`});
    else {
        birthday=birthday.length==8? birthday.substr(2):birthday;
        let scode=getsc(local, sctype, scname);
        if(answer==null) answer="[0,0,0]";
        if(scode["status"]==4) res.json(scode);
        else {
            let info=finduser(local, scode, name, birthday);
            if(info["isError"]) res.json({status:3, message:info["message"]});
            else {
                if(!haspass(local, info["token"])) {
                    res.json({status:6, message:"사이트에 들어가서 비밀번호를 설정해주세요."});
                } else {
                    let logintoken=wrtiepass(local, info["token"], password);
                    if((typeof logintoken)=="string") {
                        let users=selectugrp(local, logintoken);
                        res.json({status:0, result:registerservey(Object.keys(localnum)[Object.keys(localnum).map(s=>localnum[s]).indexOf(users[0]["lctnScCode"])], getuserinfo(local, scode, users[0]["userPNo"], users[0]["token"])["deviceUuid"], users[0]["token"], users[0]["userNameEncpt"], JSON.parse(answer))});
                    } else {
                        res.json({status:5, message:"비밀번호를 제대로 확인해주세요."});
                    }
                }
            }
        }
    }
});

app.get('/group', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let local=req.query.local;
    let sctype=req.query.sctype;
    let scname=req.query.scname;
    let name=req.query.name;
    let birthday=req.query.birth;
    let password=req.query.pass;
    let answer=req.query.answer;
    if(local==null) res.json({status:1, message:`local(지역)값을 설정해주세요.\n목록:${Object.keys(localnum)}`});
    else if(sctype==null) res.json({status:1, message:`sctype(학교종류)값을 설정해주세요.\n목록:${Object.keys(scnum)}`});
    else if(scname==null) res.json({status:1, message:`scname(학교이름)값을 설정해주세요.`});
    else if(name==null) res.json({status:1, message:`name(이름)값을 설정해주세요.`});
    else if(birthday==null) res.json({status:1, message:`birth(생일)값을 설정해주세요. (YYMMDD)`});
    else if(password==null) res.json({status:1, message:`pass(비밀번호)값을 설정해주세요.`});
    else if(!Object.keys(localnum).includes(local)) res.json({status:2, message:`local(지역)값을 확인해주세요.\n목록:${Object.keys(localnum)}`});
    else if(!Object.keys(scnum).includes(sctype)) res.json({status:2, message:`sctype(학교종류)값을 확인해주세요.\n목록:${Object.keys(scnum)}`});
    else if(birthday.length != 6 && birthday.length != 8) res.json({status:2, message:`birth(생일)값을 6자리로 설정해주세요. (YYMMDD)`});
    else if(answer != null && !isarray(answer)) res.json({status:2, message:`answer(답)값을 확인해주세요. 배열 행태로 들어가야 합니다.(0:아니오, 1:네)\n예시:[0,0,0]`});
    else if(answer != null && JSON.parse(answer).length != 3) res.json({status:2, message:`answer(답)의 갯수는 3개여야 합니다.`});
    else if(answer != null && JSON.parse(answer).filter(s=>s!==0).filter(s=>s!==1).length != 0) res.json({status:2, message:`answer(답)값을 수정해주세요. 0과 1밖에 들어갈 수 없습니다.(0:아니오, 1:네)\n예시:[0,0,0]`});
    else {
        birthday=birthday.length==8? birthday.substr(2):birthday;
        let scode=getsc(local, sctype, scname);
        if(answer==null) answer="[0,0,0]";
        if(scode["status"]==4) res.json(scode);
        else {
            let info=finduser(local, scode, name, birthday);
            if(info["isError"]) res.json({status:3, message:info["message"]});
            else {
                if(!haspass(local, info["token"])) {
                    res.json({status:6, message:"사이트에 들어가서 비밀번호를 설정해주세요."});
                } else {
                    let logintoken=wrtiepass(local, info["token"], password);
                    if((typeof logintoken)=="string") {
                        let users=selectugrp(local, logintoken);
                        res.json({status:0, result:users.map(s=>registerservey(Object.keys(localnum)[Object.keys(localnum).map(s=>localnum[s]).indexOf(s["lctnScCode"])], "", s["token"], s["userNameEncpt"], JSON.parse(answer)))});
                    } else {
                        res.json({status:5, message:"비밀번호를 제대로 확인해주세요."});
                    }
                }
            }
        }
    }
});

app.listen(30004);
