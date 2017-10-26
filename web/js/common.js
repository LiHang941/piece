

var common = {};


common.scoreList = [
    Math.pow(10,10)//Number.POSITIVE_INFINITY // 极大值 正无穷
    ,Math.pow(10,9)
    ,Math.pow(10,8)
    ,Math.pow(10,7)
    ,Math.pow(10,6)
    ,Math.pow(10,5)
    ,Math.pow(10,4)
    ,Math.pow(10,3)
    ,Math.pow(10,2)
    ,Math.pow(10,1)
    ,0
   ,Math.pow(10,10)
   ,Math.pow(10,7)
];

common.ChessType = {
    "ChangLian":11,
    "ChengWu":0,
    "HuoSi":1,
    "HuoSan":2,
    "ChongSi":3,
    "QianWu":12,
    "TiaoHuoSan":4,
    "MainSan":5,
    "HuoEr":6,
    "TiaoHuoEr":7,
    "MianEr":8,
    "QuanSiSi":9,
    "None":10,

};
/**
 * 是否是和棋
 * @returns {boolean}
 */
common.isPeace=function ($dataArray) {
    for(var i=0;i<$dataArray.length;i++){
        for(var j=0;j<$dataArray[i].length;j++){
            if($dataArray[i][j] == 0){
                return false;
            }
        }
    }
    return true;
}

//禁手判断
common.isFiveInARow = function (parseArray) {
    var $data = {flag:false,returnStr : null};
    //
    var HuoSanCount = 0;
    var LianSICount = 0;
    var ChangLianCount = 0;

    for(var i=0;i<parseArray.length;i++){
        var chessType = common.chessTypeParse(parseArray[i],2);
        if(chessType == common.ChessType.HuoSan || chessType == common.ChessType.TiaoHuoSan){
            HuoSanCount++;
        }else  if(chessType == common.ChessType.HuoSi || chessType == common.ChessType.ChongSi || chessType == common.ChessType.QianWu ){
            LianSICount++;
        }else  if(chessType == common.ChessType.ChangLian){
            ChangLianCount++;
        }
    }
    //三三禁手 两个或两个以上的活三
    if(HuoSanCount>=2){
        $data.flag = true;
        $data.returnStr = "黑棋输了,违反了三三禁手规则！~~";
        return $data;
    }
    //四四禁手
    if(LianSICount >=2){
        $data.flag = true;
        $data.returnStr = "黑棋输了,违反了四四禁手规则！~~";
        return $data;
    }
    //长连禁手
    if(ChangLianCount>=1){
        $data.flag = true;
        $data.returnStr = "黑棋输了,违反了长连禁手规则！~~";
        return $data;
    }
    return $data;
}


/**
 * 解析每一个坐标的四种Array对象
 * 即 | — / \ 四个方向的
 */
common.parseArray = function(x,y,$dataArray){
    var tempArray = new Array(4);
    for(var i=0;i<4;i++){
        tempArray[i]=new Array(9);
        for(var j=0;j<9;j++){
            tempArray[i][j]=-1;
        }
    }
    for(var i=-4;i<=4;i++){
        //垂直方向
        if( x + i>=0 &&  x + i < $dataArray.length){
            tempArray[0][i+4] = $dataArray[x+i][y] ;
        }
        //水平
        if( y + i >= 0 && y + i < $dataArray[x].length){
            tempArray[1][i+4] = $dataArray[x][y + i] ;
        }
        //右上
        if(x + i>=0 && x + i < $dataArray.length && y - i >= 0 && y - i < $dataArray[x+i].length ){
            tempArray[2][i+4] =  $dataArray[x + i][y - i] ;
        }
        //右下
        if(x + i >= 0 && x + i < $dataArray.length && y + i >= 0&& y + i < $dataArray[x+i].length ){
            tempArray[3][i+4] =  $dataArray[x + i][y + i] ;
        }
    }
    return tempArray;
}

/**
 * 得到棋的类型
 * @param lineArr 每一个坐标的四种Array对象
 * @param $value  对象值
 * @returns {number}
 */
common.chessTypeParse =  function (lineArr,$value) {
    var duishouValue = $value == 1 ? 2 : 1;
    //左侧连续数目
    var leftCount = 0;
    var leftLast = 4;
    //右侧相同数目
    var rightCount = 0;
    var rightLast = 4;
    for(var i=3;i>=0 ;i--){
        if(lineArr[i] == $value){
            leftCount++;
            leftLast--;
        }else{
            break;
        }
    }
    for(var i=5;i<lineArr.length;i++){
        if(lineArr[i] == $value){
            rightCount++;
            rightLast++;
        }else{
            break;
        }
    }
    // 成5：即构成五子连珠 100分
    // 中心点相连而成的连续子有5个：不管哪种情况，都可以直接判断为成5：
    if(leftCount + rightCount >= 4){
        if(leftCount + rightCount >=6){
            return common.ChessType.ChangLian;  //长连
        }
        return common.ChessType.ChengWu;
    }
    //成四  中心点相连而成的连续子有4个
    if(leftCount + rightCount == 3){
        if(lineArr[leftLast -1 ] == 0 && lineArr[rightLast +1] == 0){
            //活四  两头均为null  活4：即构成两边均不被拦截的四子连珠。
            return common.ChessType.HuoSi;
        }else{
            if((lineArr[leftLast -1] == duishouValue || lineArr[leftLast -1] == -1)
                &&  ( lineArr[ rightLast +1] == 0 )){
                //冲四：一头为墙或者为对手棋
                return common.ChessType.ChongSi;
            }
            if(( lineArr[ rightLast +1] == duishouValue || lineArr[rightLast +1] == -1 ) && lineArr[leftLast -1] == 0){
                //冲四：一头为墙或者为对手棋
                return common.ChessType.ChongSi;
            }

            //全死四
            return 10;
        }
    }
    //成3  中心点相连而成的连续子有3个  活3：两边均不被拦截的三字连珠
    if(leftCount + rightCount == 2){
        if(leftCount == 2 && lineArr[4 + 1] == 0 && lineArr[4 + 3] == $value ){
            return common.ChessType.QianWu;
        }

        if(rightCount == 2 && lineArr[4 - 1] == 0 && lineArr[4 - 3] == $value ){
            return common.ChessType.QianWu;
        }

        //活三 两头不拦截 且两头的下一位都不是拦截的
        if(lineArr[leftLast -1] == 0 && lineArr[rightLast +1] == 0){

            if(((lineArr[leftLast - 2] != duishouValue && lineArr[leftLast - 2] != -1)
                    || (lineArr[rightLast + 2] != duishouValue &&lineArr[rightLast + 2 ] != -1 ))){
                //普通活3
                return common.ChessType.HuoSan;
            }

            if(((lineArr[leftLast - 2] == duishouValue || lineArr[leftLast - 2] == -1)
                    || (lineArr[rightLast + 2] == duishouValue  || lineArr[rightLast + 2 ] == -1 ))){
                //眠3
                return common.ChessType.MainSan;
            }
        }

        if((lineArr[leftLast -1] == duishouValue || lineArr[leftLast -1] == -1) &&
            (lineArr[rightLast +1] == 0 || lineArr[rightLast +1] == -1)){
            //死3
            return common.ChessType.None;
        }

    }

    //成2
    if(leftCount + rightCount == 1){

        if(rightCount == 1 && lineArr[4 - 2]== $value && lineArr[4-1] == 0 ){
            if( lineArr[4 - 3]== 0 &&  lineArr[rightLast + 1]== 0){
                //跳活3
                return common.ChessType.TiaoHuoSan;
            }
            if( (lineArr[4 - 3]== duishouValue || lineArr[4 - 3]== -1 ) && lineArr[rightLast + 1] == 0 ){
                return common.ChessType.MainSan;
            }
            if(  lineArr[4 - 3]== 0 &&(lineArr[rightLast + 1] == duishouValue || lineArr[rightLast + 1] == -1)){
                return common.ChessType.MainSan;
            }
        }

        if(leftCount == 1 && lineArr[4 + 2]== $value && lineArr[4 + 1] == 0 ){
            if(lineArr[4 + 3 ] == 0 && lineArr[leftLast - 1 ] == 0) {
                return common.ChessType.TiaoHuoSan;
            }
            if( (lineArr[4 + 3]== duishouValue || lineArr[4 - 3]== -1 ) && lineArr[leftLast - 1] == 0 ){
                return common.ChessType.MainSan;
            }
            if(  lineArr[4 + 3]== 0 &&(lineArr[leftLast - 1] == duishouValue || lineArr[leftLast - 1] == -1)){
                return common.ChessType.MainSan;
            }
        }

        if(lineArr[leftLast -1]==0 && lineArr[rightLast +1] ==0){
            return common.ChessType.HuoEr;
        }else{
            //眠2
            return common.ChessType.MianEr;
        }
    }

    // 周围一个棋都没有
    if(leftCount + rightCount == 0){
        if(lineArr[4-1] == 0 && lineArr [4+1] == 0){
            //跳眠3
            if(lineArr[4-2] == $value && lineArr[4-3] == 0 && lineArr[4+2] == $value && lineArr[4+3] == 0){
                return common.ChessType.MainSan;
            }
            //跳活2  前一位和后一位没有棋
            if(lineArr[4-2] == $value  ){
                if(lineArr[4-3] == 0){
                    return common.ChessType.TiaoHuoEr;
                }
                if(lineArr[4-3] == duishouValue || lineArr[4-3] == -1){
                    return common.ChessType.MianEr;
                }
            }
            //跳活2
            if(lineArr[4+2] == $value ){
                if(lineArr[4+3] == 0){
                    return common.ChessType.TiaoHuoEr;
                }
                if(lineArr[4+3] == duishouValue || lineArr[4+3] == -1){
                    return common.ChessType.MianEr;
                }
            }
            //跳活2
            if(lineArr[4-2] ==0 && lineArr[4-3] == $value  ){
                if(lineArr[4-4] == 0){
                    return common.ChessType.TiaoHuoEr;
                }
                if(lineArr[4-4] == duishouValue || lineArr[4-4] == -1){
                    return common.ChessType.MianEr;
                }
            }
            //跳活2
            if(lineArr[4+2] ==0 && lineArr[4+3] == $value && lineArr[4+4] == 0){
                if(lineArr[4+4] == 0){
                    return common.ChessType.TiaoHuoEr;
                }
                //眠二
                if(lineArr[4+4] == duishouValue || lineArr[4+4] == -1){
                    return common.ChessType.MianEr;
                }
            }
            //
            if(lineArr[4+2] ==0 && lineArr[4+3] == 0 && lineArr[4+4] == $value){
                return common.ChessType.MianEr;
            }
            if(lineArr[4-2] ==0 && lineArr[4-3] == 0 && lineArr[4-4] == $value){
                return common.ChessType.MianEr;
            }
        }
        return common.ChessType.None;
    }
    return common.ChessType.None;
};



common.logArr = [];
common.logFlag = false;
common.log = function (str) {
    common.logArr.unshift(str);
    if(common.logFlag == false){
        common.logFlag = true;
        var showalert = function () {
           var s =  common.logArr.pop()
            if(s != null){
                document.getElementById("stateLog").innerHTML = s;
            }
        }
        window.setInterval(showalert, 500);
    }
}

