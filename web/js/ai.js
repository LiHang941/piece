/**
 *
 * 五子棋Ai方法
 *
 * */
var pieceAI = {};
pieceAI.$GAME_DATA_All = null;
//黑棋成绩数据
pieceAI.blockScoreData ;
//白旗成绩数据
pieceAI.whriteScoreData ;
/**
 * 开始
 * @param $GAME_DATA_All
 */
pieceAI.start = function ($GAME_DATA_All) {
    pieceAI.$GAME_DATA_All = $GAME_DATA_All;
    pieceAI.blockScoreData =  {x:0,y:0,score:0};
    pieceAI.whriteScoreData =  {x:0,y:0,score:0};
    //遍历节点
    for(var i=0;i<pieceAI.$GAME_DATA_All.length;i++){
        for(var j=0;j<pieceAI.$GAME_DATA_All[i].length;j++){
            if(pieceAI.$GAME_DATA_All[i][j] == 0){
                var tempArray = pieceAI.parseArray(i,j);
                pieceAI.parseArraytoScore(i,j,tempArray);
            }
        }
    }
    var $data = {};

    //判断分值  对方成绩高则进攻 反之防守
    if(pieceAI.blockScoreData.score >= pieceAI.whriteScoreData.score){
        $data.x = pieceAI.blockScoreData.x;
        $data.y = pieceAI.blockScoreData.y;
        $data.score = pieceAI.blockScoreData.score;
    }else{
        $data.x = pieceAI.whriteScoreData.x;
        $data.y = pieceAI.whriteScoreData.y;
        $data.score = pieceAI.whriteScoreData.score;
    }
    //返还坐标
    return $data;
};
/**
 * 解析每一个坐标的四种Array对象
 * 即 | — / \ 四个方向的
 */
pieceAI.parseArray = function (x,y) {
    var tempArray = new Array(4);
    for(var i=0;i<4;i++){
        tempArray[i]=new Array(9);
        for(var j=0;j<9;j++){
            tempArray[i][j]=-1;
        }
    }
    for(var i=-4;i<=4;i++){
        //垂直方向
        if( x + i>=0 &&  x + i < pieceAI.$GAME_DATA_All.length){
            tempArray[0][i+4] = pieceAI.$GAME_DATA_All[x+i][y] ;
        }
        //水平
        if( y + i >= 0 && y + i < pieceAI.$GAME_DATA_All[x].length){
            tempArray[1][i+4] = pieceAI.$GAME_DATA_All[x][y + i] ;
        }
        //右上
        if(x + i>=0 && x + i < pieceAI.$GAME_DATA_All.length && y - i >= 0 && y - i < pieceAI.$GAME_DATA_All[x+i].length ){
            tempArray[2][i+4] =  pieceAI.$GAME_DATA_All[x + i][y - i] ;
        }
        //右下
        if(x + i >= 0 && x + i < pieceAI.$GAME_DATA_All.length && y + i >= 0&& y + i < pieceAI.$GAME_DATA_All[x+i].length ){
            tempArray[3][i+4] =  pieceAI.$GAME_DATA_All[x + i][y + i] ;
        }
    }
    return tempArray;
};

/**
 * 解析得到的数组,并打分
 */
pieceAI.parseArraytoScore = function (x,y,array) {
    var blockScoreSum = 0;
    var whriteScoreSum = 0;
    var blockScoreSumArr = [];
    var whriteScoreSumArr = [];

    var blockScoreSumStr = "";
    var whriteScoreSumStr = "";
    for(var i=0;i<array.length;i++){
        //给黑棋打分
        var blockScore = pieceAI.scorePares(array[i],2);
        blockScoreSumArr.push(blockScore);
        blockScoreSumStr = blockScoreSumStr + "##" + blockScore;
        //给白棋打分
        var whriteScore = pieceAI.scorePares(array[i],1);
        whriteScoreSumArr.push(whriteScore);
        whriteScoreSumStr = whriteScoreSumStr + "##" + whriteScore;
    }
    blockScoreSum = pieceAI.scoreSumArrPares(blockScoreSumArr);
    whriteScoreSum = pieceAI.scoreSumArrPares(whriteScoreSumArr);


    // if(blockScoreSum > 0) {
    //     console.log("blockScoreData:" + JSON.stringify(array) + "##" + blockScoreSumStr);
    //     console.log("-----------" + x + "-----------" + y + "------------------------------");
    // }
    // if(whriteScoreSum > 0) {
    //     console.log("whriteScoreData:" + JSON.stringify(array) + "##" + whriteScoreSumStr);
    //     console.log("-----------" + x + "-----------" + y + "------------------------------");
    // }
    if(pieceAI.blockScoreData.score < blockScoreSum){
        pieceAI.blockScoreData.x = x;
        pieceAI.blockScoreData.y = y;
        pieceAI.blockScoreData.score = blockScoreSum;
    }

    if(pieceAI.whriteScoreData.score < whriteScoreSum){
        pieceAI.whriteScoreData.x = x;
        pieceAI.whriteScoreData.y = y;
        pieceAI.whriteScoreData.score = whriteScoreSum;
    }

};

/**
 * 计算AI分数
 * @param lineArr
 * @param $value
 * @returns {number}
 */
pieceAI.scorePares =  function (lineArr,$value) {
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
        return 1000000;
    }

    //成四  中心点相连而成的连续子有4个
    if(leftCount + rightCount == 3){

        if(lineArr[leftLast -1 ] == 0 && lineArr[rightLast +1] == 0){
            //活四  两头均为null  活4：即构成两边均不被拦截的四子连珠。 90分
            return 100000;
        }else{
            if(lineArr[leftLast -1] == duishouValue || lineArr[leftLast -1] == -1
                || lineArr[ rightLast +1] == duishouValue || lineArr[rightLast +1] == -1 ){
                //冲四：一头为墙或者为对手棋
                return 4000;
            }
            //全死四
            return 1;
        }
    }
    //成3  中心点相连而成的连续子有3个  活3：两边均不被拦截的三字连珠 80分
    if(leftCount + rightCount == 2){

        //活三 两头不拦截 且两头的下一位都不是拦截的
        if(lineArr[leftLast -1] == 0 && lineArr[rightLast +1] == 0){
            if(((lineArr[leftLast - 2] != duishouValue && lineArr[leftLast - 2] != -1)
                    && (lineArr[rightLast + 2] != duishouValue &&lineArr[rightLast + 2 ] != -1 ))){
                //普通活3
                return 5000;
            }else {
                //眠3
                return 1000;
            }
        }else {
            //眠3
            return 1000;
        }
    }

    //成2
    if(leftCount + rightCount == 1){
        //跳活3
        if(rightCount == 1 && lineArr[4 - 2]== $value && lineArr[4 - 3]== 0 &&  lineArr[rightLast + 1]== 0  ){
            return 2500;
        }
        if(leftCount == 1 && lineArr[4 + 2]== $value && lineArr[4 + 3 ] == 0 && lineArr[leftLast + 1 ] == 0){
            return 2500;
        }

        if(lineArr[leftLast -1]==0 && lineArr[rightLast +1] ==0){
            return 200;
        }else{
            //眠2
            return 50;
        }
    }

    // 周围一个棋都没有
    if(leftCount + rightCount == 0){
        //跳活2  前一位和后一位没有棋
        if(lineArr[4-1] == 0 && lineArr [4+1] == 0){
            if(lineArr[4-2] == $value && lineArr[4-3] == 0){
                return 100;
            }
            if(lineArr[4+2] == $value && lineArr[4+3] == 0){
                return 100;
            }
            if(lineArr[4-2] ==0 && lineArr[4-3] == $value && lineArr[4-4] == 0){
                return 100;
            }
            if(lineArr[4+2] ==0 && lineArr[4+3] == $value && lineArr[4+4] == 0){
                return 100;
            }
        }
        return 1;
    }
    return 0;
};

/**
 * 根据成绩解析多联关系
 * @param arr
 * @param sum
 */
pieceAI.scoreSumArrPares = function (arr) {
    var huo4 = 0;
    var chong4 = 0;
    var huo3 = 0;
    var sum = 0;
    for(var i=0;i<arr.length;i++){
        sum = sum + arr[i];
        if(arr[i] == 100000){
            huo4++;
        }
        if(arr[i] == 4000){
            chong4++;
        }
        if(arr[i] == 5000){
            huo3 ++;
        }
    }

    //冲4 活3
    if(chong4>=1 && huo3 >=1){
        sum = 90000;
    }
    //双活3
    if(huo3 >= 2){
        sum = 90000;
    }

    //双冲4
    if(chong4 >= 2){
        sum = 900000;
    }
    return sum;
};
