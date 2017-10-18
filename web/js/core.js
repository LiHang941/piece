


//=============================
// 游戏配置
//=============================

/**
 * 基础配置
 */
var GAME_CONFIG = {
    //界面配置
    window:{
        width:400,
        height:400,
        line_color:"#2F4056", //线条颜色
        line_width:1, // 棋子线条宽度px
        box_height:20,  //棋子高度px
        box_width:20,   //棋子宽度px
        piece_white_color:"#FFFFFF",
        piece_black_color:"#000000",
    },
    game:{
        TheUpperHand : true,  //先手是谁  true 玩家  false 电脑
        $lineCount:0,
        $columnCount:0,
        $elementIdName:"",
        rank:0,  //机器人等级
    }
};

//================================
// 下棋核心方法
//================================


/**
 * core.js核心对象
 * @type {{}}
 */
var piece = {};

/**
 * 机器人回调
 * @type {null}
 */
piece.aICallBack = null;


/**
 * 游戏中的数据  存放  0 空位 1 白棋 2黑棋
 * @type {array[i][j]}
 */
piece.$GAME_DATA_All ;

/**
 * 下棋的历史记录
 * @type {Array}
 */
piece.$PieceHistory = [];

/**
 * 游戏开始构造
 * @param element
 * @param i
 * @param j
 */
piece.gameStart = function ($elementIdName) {
    var element = document.getElementById($elementIdName);
    var $lineCount = (GAME_CONFIG.window.width ) / (GAME_CONFIG.window.box_width + GAME_CONFIG.window.line_width);
    var $columnCount = (GAME_CONFIG.window.height) / (GAME_CONFIG.window.box_height + GAME_CONFIG.window.line_width);
    $lineCount = parseInt($lineCount);
    $columnCount = parseInt($columnCount);
    element.style.width = (((GAME_CONFIG.window.box_width + GAME_CONFIG.window.line_width) * $lineCount) + 50)  + "px";
    element.style.height = (((GAME_CONFIG.window.box_height + GAME_CONFIG.window.line_width) * $lineCount) + 50) +"px";
    element.style.left = (50) + "px";
    element.style.top = (50) + "px";
    GAME_CONFIG.game.$lineCount = $lineCount;
    GAME_CONFIG.game.$columnCount = $columnCount;
    GAME_CONFIG.game.$elementIdName = $elementIdName;
    piece.bannerWrite();
}



/**
 * 游戏重新开始
 * @param element
 * @param $lineCount
 * @param $columnCount
 */
piece.gameRestart = function (theUpperHandFlag) {
    //初始化数据
    piece.$PieceHistory = [];
    piece.gameOverFlag = false;
    piece.onTheOffensiveFlag = false;
    var xArray = new Array(GAME_CONFIG.game.$lineCount);
    for(var x=0;x<GAME_CONFIG.game.$lineCount;x++){
        xArray[x]=new Array(GAME_CONFIG.game.$columnCount);
        for(var y=0;y<GAME_CONFIG.game.$columnCount;y++){
            xArray[x][y]=0;
        }
    }
    piece.$GAME_DATA_All = xArray;
    var element = document.getElementById(GAME_CONFIG.game.$elementIdName);
    piece.gameInterface(element);
    GAME_CONFIG.game.TheUpperHand = theUpperHandFlag;
    // 判断是谁先手
    if(GAME_CONFIG.game.TheUpperHand == false){
        piece.pieceClick(parseInt(GAME_CONFIG.game.$lineCount / 2),parseInt(GAME_CONFIG.game.$columnCount / 2));
    }
}
/**
 * 棋子撤回
 */
piece.withdraw = function () {
    if(piece.$PieceHistory.length > 1){
        var data = piece.$PieceHistory.pop();
        //是电脑下的
        if(data.value == GAME_CONFIG.game.TheUpperHand){
            piece.$GAME_DATA_All[data.x][data.y] = 0;
            //恢复界面
            document.getElementById("piece_x_" + data.x + "_y_" + data.y).setAttribute("class","piece sun");
            data = piece.$PieceHistory.pop();
            piece.$GAME_DATA_All[data.x][data.y] = 0;
            document.getElementById("piece_x_" + data.x + "_y_" + data.y).setAttribute("class","piece sun");
        }
        //判断玩家是哪种棋子
        piece.gameOverFlag = false;
    }else{
        alert("没有能撤回的历史");
    }
}

/**
 * 游戏结束标记
 * @type {boolean}
 */
piece.gameOverFlag = false;

/**
 * 下棋标记
 * @type {setTime}
 */
piece.playChessFlag ;

/**
 * 该谁下棋   - true 白棋   -false 黑棋   默认黑棋先手
 * @type {boolean}
 */
piece.onTheOffensiveFlag = false;



/**
 * 下棋事件
 * @param dom click dom 对象
 */
piece.pieceClickEven = function (dom) {
    var x = dom.getAttribute("x");
    var y = dom.getAttribute("y");
    if(piece.playChessFlag)
        clearTimeout(piece.playChessFlag);
    piece.playChessFlag = setTimeout(piece.pieceClick(x,y),500);
}

/**
 * 下棋核心
 * @param dom
 */
piece.pieceClick = function(x,y) {
    var dom  = document.getElementById("piece_x_" + x + "_y_" + y);
    if(piece.gameOverFlag){
        return; //游戏是否结束
    }
    if(dom.getAttribute("class").indexOf("piece-click") != -1){
        return;
    }
    dom.setAttribute("class","piece piece-click");
    var $value = piece.onTheOffensiveFlag? 1:2;
    piece.$GAME_DATA_All[x][y] = $value;
    piece.$PieceHistory.push({'x':x,'y':y,'value':piece.onTheOffensiveFlag == true});
    if(piece.onTheOffensiveFlag){
        dom.style.backgroundColor = GAME_CONFIG.window.piece_white_color;
    }else{
        dom.style.backgroundColor = GAME_CONFIG.window.piece_black_color;
    }
    piece.isGameOver(x,y,$value);
    piece.onTheOffensiveFlag = !piece.onTheOffensiveFlag;

    //AI开始
    if (piece.aICallBack != null && piece.onTheOffensiveFlag==GAME_CONFIG.game.TheUpperHand){
        piece.aICallBack();
    }
}

/**
 * 判断游戏是否结束
 */
piece.isGameOver = function (x,y,$value) {
    x = parseInt(x);
    y = parseInt(y);
    var tempArray = piece.$GAME_DATA_All;
    var $x_min = (x-5<0 ? 0 :(x - 5 ));
    var $x_max = (x+5 > tempArray.length ? tempArray.length : (x + 5));

    var $y_max = (y+5> tempArray[x].length ? tempArray[x].length : (y+5) );
    var $y_min = (y-5 < 0 ?0 : (y-5));

    if($y_max - $y_min >= 5){
        //水平扫描
        for(var i=$y_min;i< $y_max;i++){
            if(i+5 > $y_max){
                break;
            }
            var count = [];
            //帮助[x][i]扫描后面五个数
            for( var temp = i; temp < (i+5); temp ++){
                if(tempArray[x][temp] != $value){
                    count = [];
                    break;
                }
                var $data = {};
                $data.x = x;
                $data.y = temp;
                count.push($data);
            }
            if(count.length == 5){
                piece.gameOver(x,y,count);
                return;
            }
        }
    }


    //垂直扫描
    if($x_max - $x_min >= 5){
        for( var i= $x_min;i< $x_max ;i++){
            if(i+5 > $x_max){
                break;
            }
            var count = [];
            //帮助[i][y]扫描后面五个数
            for(var temp = i; temp < (i+5); temp ++){
                if(tempArray[temp][y] != $value){
                    count = [];
                    break;
                }
                var $data = {};
                $data.x = temp;
                $data.y = y;
                count.push($data);
            }
            if(count.length == 5){
                piece.gameOver(x,y,count);
                return;
            }
        }
    }

    //右下和右上扫描
    var onTheTightCount = []; //右上
    var lowerRightCount = []; //右下
    for(var i = -5 ;i < 5 ;i++){
        var onTheTightY = y - i;
        var lowerRightY = y + i;
        var tempX =  x + i;

        if(tempX >= 0 && tempX < $x_max){
            if(lowerRightY >= 0 && lowerRightY < $y_max && tempArray[tempX][lowerRightY] == $value){
                var $data = {};
                $data.x = tempX;
                $data.y = lowerRightY;
                lowerRightCount.push($data);
                if(lowerRightCount.length == 5){
                    piece.gameOver(x,y,lowerRightCount);
                    return;
                }
            }else {
                lowerRightCount = [];
            }
            if(onTheTightY >= 0 && onTheTightY< $y_max && tempArray[tempX][onTheTightY] == $value){
                var $data = {};
                $data.x = tempX;
                $data.y = onTheTightY;
                onTheTightCount.push($data);
                if(onTheTightCount.length == 5){
                    piece.gameOver(x,y,onTheTightCount);
                    return;
                }
            }else {
                onTheTightCount = [] ;
            }
        }
    }
}

/**
 * 游戏结束
 * @param x
 * @param y
 * @param array 五子连珠的数组
 */
piece.gameOver=function (x , y , array) {
    piece.gameOverFlag = true;
    var color = piece.onTheOffensiveFlag ? GAME_CONFIG.window.piece_white_color :GAME_CONFIG.window.piece_black_color;
    piece.pieceTwinkle(array,true,color);
    var str = piece.onTheOffensiveFlag ? "白棋" : "黑棋";
    alert(str + "赢了");
}

/**
 * 五子连珠闪烁
 * @param array
 * @param flag
 * @param color
 */
piece.pieceTwinkle=function (array,flag,color,index) {
    if(index == null){
        index = 0;
    }
    setTimeout(function () {
        for(var i=0;i<array.length;i++){
            var $data = array[i];
            if(flag){
                document.getElementById("piece_x_" + $data.x + "_y_" + $data.y).style.backgroundColor = "red";
            }else{
                document.getElementById("piece_x_" + $data.x + "_y_" + $data.y).style.backgroundColor = color;
            }
        }
        if(index < 3){
            piece.pieceTwinkle(array,!flag,color,++index);
        }
    },500);
}


/**
 * 构建游戏界面
 * @param element dom对象
 * @param i  行数目
 * @param j  列数目
 */
piece.gameInterface = function (element) {
    var i = GAME_CONFIG.game.$lineCount;
    var j = GAME_CONFIG.game.$columnCount;
    //生成
    var $html = '';
    for(var x = 0 ;x<i;x++){
        $html = $html +  '<div class="line" style=" height: '+ (GAME_CONFIG.window.box_height+GAME_CONFIG.window.line_width )+'px;">';
        for(var y = 0 ;y<j;y++){
            var style = " width: "+GAME_CONFIG.window.box_width+"px; height:"+GAME_CONFIG.window.box_height+"px;";
            if(y < j-1){
                style = style + "border-top:" +GAME_CONFIG.window.line_width + "px solid " + GAME_CONFIG.window.line_color+ ";";
            }else{
                style = style + "padding-top:" +(GAME_CONFIG.window.line_width )  + "px;";
                style = style + "height:" +(GAME_CONFIG.window.box_height + GAME_CONFIG.window.line_width )  + "px;";
            }
            if(x < i-1){
                style = style + "border-left: " +GAME_CONFIG.window.line_width + "px solid " + GAME_CONFIG.window.line_color+ ";";
            }else{
                style = style + "width:" +(GAME_CONFIG.window.box_width + GAME_CONFIG.window.line_width )  + "px;";
            }
            if(y == 0 && x == i-1){
                style = style + "padding-left:" +(GAME_CONFIG.window.line_width )  + "px;";
            }
            var $qiziStyle = "left:-" + (GAME_CONFIG.window.box_width + GAME_CONFIG.window.line_width) /2 +"px;" +
                " top:-"+ (GAME_CONFIG.window.box_height + GAME_CONFIG.window.line_width) /2+"px;" +
                " width: "+(GAME_CONFIG.window.box_width)+"px;" +
                " height: "+(GAME_CONFIG.window.box_height)+"px;";
            $html = $html +
                '<div class="horizontal" id="horizontal_x_'+ x +'_y_'+y+'" style="'+style+'">' +
                '<div id="piece_x_'+ x +'_y_'+y+'" class="piece sun" style="'+$qiziStyle+'" x="'+x+'" y="'+y+'" onclick="piece.pieceClickEven(this)">' +
                '</div>' +
                '</div>';
        }
        $html = $html +  '</div>';
    }
    element.innerHTML = $html;
}

/**
 *  设置页面
 */
piece.setting = function () {

}

/**
 * banner 推广 输出
 */
piece.bannerWrite = function () {
    console.log("  _       _  _    _                       ____   _");
    console.log(" | |     (_)| |  | |                     |  _ \\ | |");
    console.log(" | |      _ | |__| |  __ _  _ __    __ _ | |_) || |      ___    __ _");
    console.log(" | |     | ||  __  | / _` || '_ \\  / _` ||  _ < | |     / _ \\  / _` |");
    console.log(" | |____ | || |  | || (_| || | | || (_| || |_) || |____| (_) || (_| |");
    console.log(" |______||_||_|  |_| \\__,_||_| |_| \\__, ||____/ |______|\\___/  \\__, |");
    console.log("                                    __/ |                       __/ |");
    console.log("                                   |___/                       |___/");
    console.log("更多内容尽在小航博客:http://www.lihang.xyz      ");
}