


/**
 *   ##游戏规则
 *   ##界面
 */


/**
 * 基础配置
 */
var GAME_CONFIG = {
    //界面配置
    window:{
        width:600,
        height:600,
        line_color:"blue", //线条颜色
        line_width:1, // 棋子线条宽度px
        box_height:40,  //棋子高度px
        box_width:40,   //棋子宽度px
        piece_white_color:"#FFFFFF",
        piece_black_color:"#000000",
    },
};

/**
 * 机器人回调
 * @type {null}
 */
var aICallBack = null;


/**
 * 游戏中的数据  存放  0 空位 1 白棋 2黑棋
 * @type {array[i][j]}
 */
var $GAME_DATA_All ;


/**
 * 游戏开始构造
 * @param element
 * @param i
 * @param j
 */
function gameStart(element) {
    var $lineCount = (GAME_CONFIG.window.width + 100) / (GAME_CONFIG.window.box_width + GAME_CONFIG.window.line_width);
    var $columnCount = (GAME_CONFIG.window.height+ 100) / (GAME_CONFIG.window.box_height + GAME_CONFIG.window.line_width);
    $lineCount = parseInt($lineCount);
    $columnCount = parseInt($columnCount);
    $element.style.width = (((GAME_CONFIG.window.box_width + GAME_CONFIG.window.line_width) * $lineCount) +50)  + "px";
    $element.style.height = (((GAME_CONFIG.window.box_height + GAME_CONFIG.window.line_width) * $lineCount) + 50) +"px";
    bannerWrite();
    var xArray = new Array($lineCount);
    for(var x=0;x<$lineCount;x++){
        xArray[x]=new Array($columnCount);
        for(var y=0;y<$columnCount;y++){
            xArray[x][y]=0;
        }
    }

    $GAME_DATA_All = xArray;
    gameInterface(element,$lineCount,$columnCount);
}

/**
 * 游戏结束标记
 * @type {boolean}
 */
var gameOverFlag = false;

/**
 * 下棋标记
 * @type {setTime}
 */
var playChessFlag ;

/**
 * 该谁下棋   - true 白棋   -false 黑棋   默认黑棋先手
 * @type {boolean}
 */
var onTheOffensiveFlag = false;



/**
 * 下棋事件
 * @param dom click dom 对象
 */
function pieceClickEven(dom) {
    if(playChessFlag)
        clearTimeout(playChessFlag);
    playChessFlag = setTimeout(pieceClick(dom),500);
}

/**
 * 下棋核心
 * @param dom
 */
function pieceClick(dom) {
    if(gameOverFlag){
        return; //游戏是否结束
    }
    if(dom.getAttribute("class").indexOf("piece-click") != -1){
        return;
    }
    dom.setAttribute("class","piece piece-click");
    var x = dom.getAttribute("x");
    var y = dom.getAttribute("y");
    var $value = onTheOffensiveFlag? 1:2;
    $GAME_DATA_All[x][y] = $value;
    if(onTheOffensiveFlag){
        dom.style.backgroundColor = GAME_CONFIG.window.piece_white_color;
    }else{
        dom.style.backgroundColor = GAME_CONFIG.window.piece_black_color;
    }
    isGameOver(x,y,$value);
    onTheOffensiveFlag = !onTheOffensiveFlag;

    //AI开始
    if (aICallBack != null && onTheOffensiveFlag==true){
        aICallBack();
    }
}

/**
 * 判断游戏是否结束
 */
function isGameOver(x,y,$value) {
    x = parseInt(x);
    y = parseInt(y);
    var tempArray = $GAME_DATA_All;
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
                gameOver(x,y,count);
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
                gameOver(x,y,count);
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
                    gameOver(x,y,lowerRightCount);
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
                    gameOver(x,y,onTheTightCount);
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
function gameOver(x , y , array) {
    gameOverFlag = true;
    var color = onTheOffensiveFlag ? GAME_CONFIG.window.piece_white_color :GAME_CONFIG.window.piece_black_color;
    pieceTwinkle(array,true,color);
    var str = onTheOffensiveFlag ? "白棋" : "黑棋";
    alert(str + "赢了");
}

/**
 * 五子连珠闪烁
 * @param array
 * @param flag
 * @param color
 */
function pieceTwinkle(array,flag,color) {
    setTimeout(function () {
        for(var i=0;i<array.length;i++){
            var $data = array[i];
            if(flag){
                document.getElementById("piece_x_" + $data.x + "_y_" + $data.y).style.backgroundColor = "red";
            }else{
                document.getElementById("piece_x_" + $data.x + "_y_" + $data.y).style.backgroundColor = color;
            }
        }
        pieceTwinkle(array,!flag,color);
    },500);
}


/**
 * 构建游戏界面
 * @param element dom对象
 * @param i  行数目
 * @param j  列数目
 */
function gameInterface(element,i,j) {
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
                //style = style + "padding-left:" +(GAME_CONFIG.window.line_width )  + "px;";
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
                '<div id="piece_x_'+ x +'_y_'+y+'" class="piece sun" style="'+$qiziStyle+'" x="'+x+'" y="'+y+'" onclick="pieceClickEven(this)">' +
                '</div>' +
                '</div>';
        }
        $html = $html +  '</div>';
    }
    element.innerHTML = $html;
}


/**
 * banner 推广 输出
 */
function bannerWrite() {
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