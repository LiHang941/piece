//========================
//      五子棋Ai方法
//      --依赖common.js
//========================

var pieceAI = {};
/**
 * 棋盘数据
 * @type {Array[][]}
 */
pieceAI.$GAME_DATA_All;

/**
 * 禁手是否激活
 * @type {boolean}
 */
pieceAI.isFiveInARowFlag = false;


/**
 * 白旗先手还是黑棋先手
 * @type {boolean}
 */
pieceAI.aIPieceFlag;


/**
 * 等级
 */
pieceAI.rank ;

/**
 * 开始
 * @param $GAME_DATA_All  棋盘棋子数据
 * @param $AIPieceFlag  AI是否是先手标记
 * @param $Rank     电脑等级
 * @param $isFiveInARowFlag     是否触发禁手标记
 */
pieceAI.start = function ($GAME_DATA_All,$AIPieceFlag,$Rank,$isFiveInARowFlag ) {
    var startTime = new Date().getTime();
    pieceAI.$GAME_DATA_All = $GAME_DATA_All;
    pieceAI.isFiveInARowFlag = $isFiveInARowFlag;
    pieceAI.aIPieceFlag = $AIPieceFlag;
    pieceAI.rank = $Rank;
    var $data ; //返还坐标
    if($Rank < 2 ){
        $data = pieceAI.lowerRankParse();
    }else{
        $data = pieceAI.seniorRankParse();
    }
    common.log("电脑下子:(" + $data.x + "," +$data.y +")&nbsp;&nbsp;&nbsp; 耗时:" + (new Date().getTime() - startTime) + "毫秒");
    return $data;
};

/**
 * 根据对手棋是什么颜色和等级解析出当前等级的最优
 * @param $AIPieceFlag
 * @param $rank
 */
pieceAI.lowerRankParse= function () {
    var $AIPieceFlag=pieceAI.aIPieceFlag ,$Rank = pieceAI.rank;
    var blockScoreDataArr = [],whriteScoreDataArr = [];
    //遍历节点
    for(var i=0;i<pieceAI.$GAME_DATA_All.length;i++){
        for(var j=0;j<pieceAI.$GAME_DATA_All[i].length;j++){
            if(pieceAI.$GAME_DATA_All[i][j] == 0){
                var tempArray = common.parseArray(i,j,pieceAI.$GAME_DATA_All);
                var $data = pieceAI.positionScore(tempArray);
                blockScoreDataArr.push({x:i,y:j,score:$data.blockScoreSum});
                whriteScoreDataArr.push({x:i,y:j,score:$data.whriteScoreSum});
            }
        }
    }
    //排序
    blockScoreDataArr.sort(function (a,b) {
        return a.score - b.score;
    });
    whriteScoreDataArr.sort(function (a,b) {
        return a.score - b.score;
    });
    var duishouArr = $AIPieceFlag ? blockScoreDataArr  :whriteScoreDataArr;
    var AiArr = $AIPieceFlag ? whriteScoreDataArr :blockScoreDataArr;
    var aidata =  AiArr[AiArr.length-1];
    var duishoudata =  duishouArr[duishouArr.length-1];

    //等级1
    var rank1 = function (_aiData,_duishouData) {
        var $data;
        //判断分值  对方成绩高则进攻 反之防守
        if(_aiData.score > _duishouData.score){
            $data = _aiData;
        }else{
            $data = _duishouData;
        }
        return $data;
    };
    //等级二
    var rank2 = function (_aiData,_duishouData) {
        var $data;
        var aiRankScore = _aiData.score >=10 ? (parseInt(_aiData.score.toString().charAt(0)) * parseInt(Math.pow(10,_aiData.score.toString().length-1))):0;
        var duishouRankScore = _duishouData.score >=10 ?(parseInt(_duishouData.score.toString().charAt(0)) * parseInt( Math.pow(10,_duishouData.score.toString().length-1))) : 0;
        //优化AI返回
        var optimizationAI = function (isFlag) {
            var tempDataScore = isFlag ? aiRankScore : duishouRankScore; //解析成同等级的最小分数
            var maxAI = isFlag ? _aiData : _duishouData;
            var tempArr =  isFlag ? AiArr : duishouArr;
            var toTempArr = isFlag ? duishouArr : AiArr;
            for(var i=tempArr.length-1 ;i >=0 ;i--){  //得到和AI(对手)最优的所有位置
                var tempAi = tempArr[i];
                if(tempAi.score >= tempDataScore){
                    //在最优中找到能现在对手(AI)的最优位置
                    for(var j=0;j<toTempArr.length;j++){
                        if(tempAi.x == toTempArr[j].x && tempAi.y == toTempArr[j].y && (tempAi.score+ toTempArr[j].score) > maxAI.score){
                            maxAI = tempAi;
                            maxAI.score = tempAi.score+ toTempArr[j].score;
                            break;
                        }
                    }
                }else {
                    break;
                }
            }
            return  maxAI;
        };
        //对手棋对我没有威胁
        var flag = pieceAI.isAttack(aiRankScore,duishouRankScore);
        var $data = optimizationAI(flag);
        return $data;
    };
    if($Rank == 0){//简单
        return rank1(aidata,duishoudata);
    }else{ //困难  对手分比我大我就防守
        return  rank2(aidata,duishoudata);
    }
}

/**
 * 地狱AI  向后推两步
 * 生成博弈树
 * @param duishouArr
 * @param aiArr
 */
pieceAI.seniorRankParse = function () {
    //存储可下棋的位置
    var blockScoreDataArr = [],whriteScoreDataArr = [];
    //复制棋盘数据
    var pieceDataArr = new Array(pieceAI.$GAME_DATA_All.length);
    for(var i=0;i<pieceAI.$GAME_DATA_All.length;i++){
        pieceDataArr[i] = new Array(pieceAI.$GAME_DATA_All[i].length);
        for(var j=0;j<pieceAI.$GAME_DATA_All[i].length;j++){
            pieceDataArr[i][j] = pieceAI.$GAME_DATA_All[i][j];
            if(pieceDataArr[i][j] == 0){
                var tempArray = common.parseArray(i,j,pieceAI.$GAME_DATA_All);
                var $data = pieceAI.positionScore(tempArray);
                if($data.blockScoreSum > 0){
                    blockScoreDataArr.push({x:i,y:j,score:$data.blockScoreSum});
                }
                if($data.whriteScoreSum > 0){
                    whriteScoreDataArr.push({x:i,y:j,score:$data.whriteScoreSum});
                }
            }
        }
    }
    var duishouArr = pieceAI.aIPieceFlag ? blockScoreDataArr  :whriteScoreDataArr;
    var AiArr = pieceAI.aIPieceFlag ? whriteScoreDataArr :blockScoreDataArr;
    var aiRankScore =  pieceAI.maxPieceArrRankScore(AiArr);
    var duishouRankScore = pieceAI.maxPieceArrRankScore(duishouArr);
    //得到可下位置
    var attackflag = pieceAI.isAttack(aiRankScore,duishouRankScore);
    var dataArr = pieceAI.optimization(attackflag?aiRankScore:duishouRankScore,attackflag?AiArr:duishouArr);

    //是否需要直接进攻
    //var dataArr = pieceAI.optimization(aiRankScore,AiArr).concat(pieceAI.optimization(duishouRankScore,duishouArr)).sort(function (a,b) {
     //   return a.score - b.score;
    //});
    var maxScore = Number.NEGATIVE_INFINITY,maxScoreNode = [];

    console.log("准备搜索节点个数:" + dataArr.length);
    var depth = 6 ;
    console.log("深度:" + depth);
    //计算深度
    for(var i=0;i<dataArr.length;i++){
        nextTreeCount =  0,nextTreeCut = 0;
        var $data =dataArr[i];
        $data.pieceFlag = (pieceAI.aIPieceFlag == true); //棋颜色标记
        $data.maxFlag = true;  //开始位都是max位
        $data.parentNode = null; //父节点
        //得到全局分
        var score = pieceAI.nextTree($data,pieceDataArr,Number.NEGATIVE_INFINITY,Number.POSITIVE_INFINITY,depth);
        if(score == maxScore){
            maxScoreNode.push($data);
        }
        if(score > maxScore ){
            maxScore = score;
            maxScoreNode = [$data];
        }
        console.log("i:" + i + "   nextTreeCount:" + nextTreeCount + "          nextTreeCut:" + nextTreeCut + "   data:x" + $data.x + " y:"+$data.y+" score:" + $data.score + "  score:" + score);
    }
    //下棋
    if (maxScoreNode.length == 0){
        return pieceAI.lowerRankParse(pieceAI.aIPieceFlag ,2);
    }
    var random = Math.floor(Math.random()*((maxScoreNode.length-1)-0+1)+0);
    return maxScoreNode[random];
}

/**
 * 得到当前可用棋组的等级分数
 * 此操作会排序数组
 * @param dataArr
 */
pieceAI.maxPieceArrRankScore = function (dataArr) {
    if(dataArr.length > 0){
        dataArr.sort(function (a,b) {
            return a.score - b.score;
        });
        var tempData = dataArr[dataArr.length-1];
        return tempData.score >=10 ? (parseInt(tempData.score.toString().charAt(0)) * parseInt(Math.pow(10,tempData.score.toString().length-1))):0;
    }else
        return 0;
}

/**
 * 解析得到最优的位置
 * 去除不好的位置
 * @param isFlag
 * @returns {Array}
 */
pieceAI.optimization = function (rankScore,pieceArr) {
    var dataArr = [];
    if(pieceArr.length > 0){
        for(var i=pieceArr.length-1 ;i >=0 ;i--){  //得到和AI(对手)最优的所有位置
            var pieceData = pieceArr[i];
            if(pieceData.score >= rankScore){
                dataArr.push(pieceData);
            }else {
                //取五个
                break;
            }
        }
    }
    return  dataArr;
};

/**
 * 对当前局面打分,进攻或者防守
 * @param aiData
 * @param duishouData
 * @param aiRankScore
 * @param duishouRankScore
 * @returns {boolean}  true 进攻  false 防守
 */
pieceAI.isAttack = function (aiRankScore,duishouRankScore) {

    if(aiRankScore >0 && duishouRankScore < (5*Math.pow(10,8))){
       return true;
    }else{
        if(aiRankScore == 0){
            return false;
        }
        //有威胁  看对手的评分等级谁大
        if(aiRankScore  == Math.pow(10,10) || aiRankScore >= duishouRankScore ){ //我先成5 或者 我的分大于对手的分
            return true;
        }else{
            //对手等级分比你大
            if(aiRankScore == Math.pow(10,7) && duishouRankScore < Math.pow(10,10)){ //我冲四  你不是成五
                return true;
            }
            //你的等级评分高，但我看看能不能反击
            //你的威胁不够大，我能反击
            if(((aiRankScore == Math.pow(10,8)) //我火3
                    || (aiRankScore == Math.pow(10,7)) //我冲4
                ) && duishouRankScore == 5*Math.pow(10,8)){ //你双火3
                return true;
            }
            if(Math.abs(aiRankScore- duishouRankScore)< (200000000) && Math.abs(aiRankScore - duishouRankScore) > (100000000)  ){
                return true;
            }else{
                return false;
            }
        }
    }
}


var nextTreeCount =  0;
var nextTreeCut = 0;

/**
 * 递归生成下一个节点  并通过剪枝优化
 * @param node
 * @param pieceDataArr
 * @param a
 * @param b
 * @param depth
 */
pieceAI.nextTree = function (node,pieceDataArr,a,b,depth) {
    nextTreeCount++;
    node.nextArr = [];
    var bestValue, curValue;
    if(Math.abs(node.score) >= Math.pow(10,10) || 0 == depth){
        return node.score ; // 全局打分
    }
    var blockScoreDataArr = [],whriteScoreDataArr = [];
    pieceDataArr[node.x][node.y] = (node.pieceFlag == true ? 1:2);//下棋
    //得到节点
    for(var x = 0;x < pieceDataArr.length ; x++){
        for(var y = 0;y<pieceDataArr[x].length ; y++){
            if(pieceDataArr[x][y] == 0){
                var tempArray = common.parseArray(x,y,pieceDataArr);
                var $data = pieceAI.positionScore(tempArray);
                if ($data.blockScoreSum > 0)
                    blockScoreDataArr.push({x:x,y:y,score:$data.blockScoreSum});
                if($data.whriteScoreSum > 0)
                    whriteScoreDataArr.push({x:x,y:y,score:$data.whriteScoreSum});
            }
        }
    }

    //判断对手棋
    var duishouArr = !node.pieceFlag  ? blockScoreDataArr  :whriteScoreDataArr;
    var aiArr = !node.pieceFlag ? whriteScoreDataArr :blockScoreDataArr;

    var duishouRankScore =  pieceAI.maxPieceArrRankScore(duishouArr);
    var aiRankScore = pieceAI.maxPieceArrRankScore(aiArr);
    
    var attackflag = pieceAI.isAttack(aiRankScore,duishouRankScore);
    var dataArr = pieceAI.optimization(attackflag?aiRankScore:duishouRankScore,attackflag?aiArr:duishouArr).sort(function (a,b) {
        return a.score - b.score;
    });

    var head = "  ";
    for(var i=3;i>=depth;i--){
        head += head;
    }
    console.log(head + " depth:" + (3-depth) + "   搜索节点个数:" + dataArr.length + "--" + JSON.stringify(dataArr));

    if(node.maxFlag == false){
        for(var i=0;i<dataArr.length;i++){
            if (a >= b){
                nextTreeCut ++;
                pieceDataArr[node.x][node.y] = 0;
                return a;
            }
            var $data = dataArr[i];
            $data.maxFlag = (!node.maxFlag);
            $data.parentNode = node;
            $data.pieceFlag = (!node.pieceFlag);
            curValue = pieceAI.nextTree($data,pieceDataArr,a,b,depth-1);
            if (curValue > a) {
                a = curValue;
            }
            node.nextArr.push($data);
        }
        bestValue =  a;
    }else{
        for(var i=0;i<dataArr.length;i++){
            if (a >= b){
                nextTreeCut ++;
                pieceDataArr[node.x][node.y] = 0;
                return b;
            }
            var $data = dataArr[i];
            $data.maxFlag = (!node.maxFlag);
            $data.parentNode = node;
            $data.pieceFlag = (!node.pieceFlag);
            $data.score = -$data.score;
            curValue = pieceAI.nextTree($data,pieceDataArr,a,b,depth-1);
            if (curValue < b) {
                b = curValue; //子节点的最小值记录到beta中
            }
            node.nextArr.push($data);
        }
        bestValue =  b;
    }
    pieceDataArr[node.x][node.y] = 0; //恢复
    return bestValue;
}


/**
 * 返回底部节点的全局评分
 * @param node
 * @returns {number}
 */
pieceAI.pieceDepthNodeScoreSum = function (node) {
    if(node.parentNode == null ){
        return node.score;
    }else{
        //有父节点
        return node.score + pieceAI.pieceDepthNodeScoreSum(node.parentNode);
    }
}


/**
 * 从上往下找
 * @param maxNode
 * @returns {*}
 */
pieceAI.pieceNodeScoreSum = function (maxNode) {
    //节点的最大分数
    if(typeof(maxNode.nextArr)!="undefined" && maxNode.nextArr.length > 0 ){
       var absMaxSum =  maxNode.nextArr[0].score; //绝对值最大的值
       return absMaxSum + pieceAI.pieceNodeScoreSum(maxNode.nextArr[0]);
    }else{
        return 0;
    }
}
/**
 * 位置评分
 * @param $dataArr
 * @returns {{}}
 */
pieceAI.positionScore = function ($dataArr) {
    var $data = {},blockScoreSumArr=[],whriteScoreSumArr=[],isFiveInARowFlag= false;
    //黑棋触发禁手标记
    if(pieceAI.isFiveInARowFlag && common.isFiveInARow($dataArr).flag == true){
        isFiveInARowFlag = true; //触发禁手
    }
    for(var i=0;i<$dataArr.length;i++){
        //给黑棋打分
        //触发禁手的黑棋不给予打分策略直接给0分
        if(isFiveInARowFlag == false){
            var blockScore = pieceAI.scorePares($dataArr[i],2);
            blockScoreSumArr.push(blockScore);
        }
        //给白棋打分
        var whriteScore = pieceAI.scorePares($dataArr[i],1);
        whriteScoreSumArr.push(whriteScore);
    }
    if(isFiveInARowFlag == false){
        $data.blockScoreSum = pieceAI.scoreSumArrPares(blockScoreSumArr);
    }else{
        $data.blockScoreSum = 0;
    }
    $data.whriteScoreSum = pieceAI.scoreSumArrPares(whriteScoreSumArr);
    return $data;
}
/**
 * 给指定的棋打分
 * @param $dataArr
 * @param pieceFlag true 白棋
 * @returns {{}}
 */
pieceAI.positionToColorScore = function ($dataArr,pieceFlag) {
    var $data = {},blockScoreSumArr=[],whriteScoreSumArr=[],isFiveInARowFlag= false;
    //白棋
    if(pieceFlag == true){
        for(var i=0;i<$dataArr.length;i++){
            //给白棋打分
            var whriteScore = pieceAI.scorePares($dataArr[i],1);
            whriteScoreSumArr.push(whriteScore);
            $data.score = pieceAI.scoreSumArrPares(whriteScoreSumArr);
        }
    }else{
        //黑棋触发禁手标记
        if(pieceAI.isFiveInARowFlag && common.isFiveInARow($dataArr).flag == true){
            isFiveInARowFlag = true; //触发禁手
        }
        for(var i=0;i<$dataArr.length;i++){
            //给黑棋打分
            //触发禁手的黑棋不给予打分策略直接给0分
            if(isFiveInARowFlag == false){
                var blockScore = pieceAI.scorePares($dataArr[i],2);
                blockScoreSumArr.push(blockScore);
            }
        }
        if(isFiveInARowFlag == false){
            $data.score = pieceAI.scoreSumArrPares(blockScoreSumArr);
        }else{
            $data.score = 0;
        }
    }
    return $data;
}
/**
 * 计算AI分数
 * @param lineArr
 * @param $value
 * @returns {number}
 */
pieceAI.scorePares =  function (lineArr,$value) {
    return common.scoreList[common.chessTypeParse(lineArr,$value)];
};
/**
 * 根据成绩解析多联关系
 * @param arr
 * @param sum
 */
pieceAI.scoreSumArrPares = function (arr) {
    var huo4=0,chong4=0,huo3=0,thuo3=0,sum = 0;
    for(var i=0;i<arr.length;i++){
        sum = sum + arr[i];
        if(arr[i] == Math.pow(10,9)){
            huo4++;
        }
        if(arr[i] == Math.pow(10,7) ){
            chong4++;
        }
        if(arr[i] == Math.pow(10,8)){
            huo3 ++;
        }
        if(arr[i] == Math.pow(10,6)){
            thuo3 ++ ;
        }
    }
    //冲4 活3
    if(chong4>=1 && huo3 >=1){
        sum = 9* Math.pow(10,8);
        return sum;
    }
    //双冲4
    if(chong4>=2){
        sum = 9*Math.pow(10,8);
        return sum;
    }
    //双活3
    if(huo3 >= 2){
        sum = 5*Math.pow(10,8);
        return sum;
    }
    if(thuo3 >= 2){
        sum = 5*Math.pow(10,8);
        return sum;
    }
    if(thuo3>=1 && huo3>=1){
        sum = 5*Math.pow(10,8);
        return sum;
    }
    return sum;
};
