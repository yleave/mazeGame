
var chess = document.getElementById('myCanvas');    //迷宫地图画布
var ctx_chess = chess.getContext('2d');
var rect = document.getElementById('myCanvas');     //移动方块画布
var ctx_rect = rect.getContext('2d');

function MazeMap() {    //迷宫地图构造类
    this.mapSize = 14;
    this.borderSize = 30;
    this.tree = [];  //并查集
    this.isConnect = []; //标识两点是否相连
    this.initialTree = function () {
        for(var i = 0; i < this.mapSize; i++){
            this.tree[i] = [];
            for(var j = 0; j < this.mapSize; j++){
                this.tree[i][j] = -1;
            }
        }
    };
    this.initialIsConnect = function () {
        for(var i = 0; i < this.mapSize * this.mapSize; i++){ //存储任意两点间是否可达的状态
            this.isConnect[i] = [];
            for(var j = 0; j < this.mapSize * this.mapSize; j++){
                this.isConnect[i][j] = -1;
            }
        }
    }
}

MazeMap.prototype.drawChessBoard = function () {    //画棋盘
    for(var i = 0; i <= this.mapSize; i++){
        ctx_chess.strokeStyle = 'gray';
        ctx_chess.moveTo(15 + this.borderSize * i,15);  //画 mapSize 条竖线
        ctx_chess.lineTo(15 + this.borderSize * i,15 + this.mapSize * this.borderSize);
        ctx_chess.stroke();
        ctx_chess.moveTo(15,15 + this.borderSize * i);  //画 mapSize 条横线
        ctx_chess.lineTo(15 + this.mapSize * this.borderSize,15 + this.borderSize * i);
        ctx_chess.stroke();
    }
};

MazeMap.prototype.getRowAndCol = function (pos) {
    var res = [];
    res.push(Math.floor(pos / this.mapSize));   //获取单元格所在行数,从 0 行开始
    res.push(pos % this.mapSize);   //获取单元格所在列数，从 0 开始
    return res;
};

MazeMap.prototype.getNeighbourId = function (pos) {    //随机获得邻居 ID 号
    var posArr = this.getRowAndCol(pos);
    var row = posArr[0];
    var col = posArr[1];
    var myNeighbour = new Array();  //存放邻居所在单元格编号
    if(row - 1 >= 0){myNeighbour.push((row - 1) * this.mapSize + col);} //位于正上方的邻居
    if(row + 1 < this.mapSize){myNeighbour.push((row + 1) * this.mapSize + col);}  //位于下方的邻居
    if(col - 1 >= 0){myNeighbour.push(pos - 1);}   //位于左边的邻居
    if(col + 1 < this.mapSize){myNeighbour.push(pos + 1);}  //位于右边的邻居
    var n = Math.floor(Math.random() * myNeighbour.length);
    return myNeighbour[n];
};

MazeMap.prototype.getRoot = function (pos) {    //获取并查集的根
    var posArr = this.getRowAndCol(pos);
    var row = posArr[0];
    var col = posArr[1];
    var id = this.tree[row][col];
    if(id >= 0){    // id = -1 为根
        return this.getRoot(id);
    }
    return pos;
};

MazeMap.prototype.union = function (pos_a,pos_b){
    var ra = this.getRoot(pos_a);
    var rb = this.getRoot(pos_b);
    if(ra !== rb){
        var posArr = this.getRowAndCol(rb);
        var row_b = posArr[0];
        var col_b = posArr[1];
        this.tree[row_b][col_b] = ra;    //将 pos_b 接在 pos_a 的根结点上
    }
};

MazeMap.prototype.clearLine = function (pos_a,pos_b) {  //擦除两个单元格之间的线段
    var posArr_a = this.getRowAndCol(pos_a);
    var posArr_b = this.getRowAndCol(pos_b);
    var row_a = posArr_a[0];
    var col_a = posArr_a[1];
    var row_b = posArr_b[0];
    var col_b = posArr_b[1];
    var mid_row = Math.ceil((row_a + row_b) / 2);
    var mid_col = Math.ceil((col_a + col_b) / 2);
    if(row_a === row_b){    //若两个单元格行相同,擦除中间的竖线
        ctx_chess.clearRect(14 + this.borderSize * mid_col,16 + this.borderSize * mid_row,2,this.borderSize - 2);
    }else if(col_a === col_b){  //若列相同，则去掉中间的横线
        ctx_chess.clearRect(16 + this.borderSize * mid_col,14 + this.borderSize * mid_row,this.borderSize - 2,2);
    }
};

MazeMap.prototype.drawMazeMap = function () {
    while (this.getRoot(0) !== this.getRoot(this.mapSize * this.mapSize - 1)){
        var n = Math.floor(Math.random() * this.mapSize * this.mapSize);    //随机获取迷宫中的一个单元格
        var neighbour = this.getNeighbourId(n); //获取其邻居编号
        if(this.getRoot(n) !== this.getRoot(neighbour)){    //若与其邻居不在一个并查集中
            this.isConnect[n][neighbour] = 1;   //互相标识相连
            this.isConnect[neighbour][n] = 1;
            this.clearLine(n,neighbour);    //擦除中间的线条
            this.union(n,neighbour);    //合并
        }
    }
};

var maze = new MazeMap();
maze.initialIsConnect();
maze.initialTree();
maze.drawChessBoard();
maze.drawMazeMap();

function Rect() {   //移动矩形的构造函数 , 小矩形距单元格边界 5px
    this.x = 20;    
    this.y = 20;
    this.len = 20;
    this.state = 0;
    this.isEnd = false;
    this.row = 0;   //所在行列
    this.col = 0;
    this.outX = maze.mapSize * maze.borderSize - 10;
    this.outY = maze.mapSize * maze.borderSize - 10;
}

var h = 0,m = 0,s = 0,ms = 0,time = 0;

var rectangle = new Rect();

function formatTime(n) {
    if(n < 10){
        return '0' + n;
    }else{
        return n;
    }
}

function formatMs(n) {
    if(n < 10) {
        return '00' + n;
    }else{
        return '0' + n;
    }
}

function timer() {
    ms += 50;
    if(ms >= 1000){
        ms = 0;
        s += 1;
    }
    if(s >= 60){
        s = 0;
        m += 1;
    }
    if(m >= 60){
        m = 0;
        h += 1;
    }
    var str = formatTime(h) + '时' + formatTime(m) + '分' + formatTime(s) + '秒' + formatMs(ms) + '毫秒';
    var myTime = document.getElementById('myTime');
    myTime.innerHTML = str;
}

function start() {
    rectangle.state = 1;
    time = setInterval(timer,50);
}


function stop() {
    rectangle.state = 0;
    clearInterval(time);
}

function renovates() {  //重置
    document.location.reload();
}

Rect.prototype.doKeyDown = function (e) {
    //获取按下键的 unicode 值,keyCode 和 which 都是按下的键的字符代码
    e = e || window.event;
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
    if(rectangle.state === 1){  //开始状态
        if(charCode === 38 || charCode === 87){ //按下 上 键或 W 键
            if(rectangle.row > 0){  //若不在第一行
                if(maze.isConnect[rectangle.row * maze.mapSize + rectangle.col][(rectangle.row - 1) * maze.mapSize + rectangle.col] === 1){ //若与上方单元格连通
                    rectangle.clearRect();
                    rectangle.y -= 30;
                    rectangle.row -= 1;
                    ctx_rect.fillRect(rectangle.x,rectangle.y,rectangle.len,rectangle.len);
                    e.preventDefault(); //取消事件的默认动作。
                    rectangle.isOver();
                    rectangle.showNextChessBoard();
                }
            }
        }
        if(charCode === 40 || charCode === 83){ //按下 下 键或 S 键
            if(rectangle.row < maze.mapSize){  //若不在最后一行
                if(maze.isConnect[rectangle.row * maze.mapSize + rectangle.col][(rectangle.row + 1) * maze.mapSize + rectangle.col] === 1){ //若与下方单元格连通
                    rectangle.clearRect();
                    rectangle.y += 30;
                    rectangle.row += 1;
                    ctx_rect.fillRect(rectangle.x,rectangle.y,rectangle.len,rectangle.len);
                    e.preventDefault(); //取消事件的默认动作。
                    rectangle.isOver();
                    rectangle.showNextChessBoard();
                }
            }
        }
        if(charCode === 37 || charCode === 65){ //按下 左 键或 A 键
            if(rectangle.col > 0){  //若不在第一列
                if(maze.isConnect[rectangle.row * maze.mapSize + rectangle.col][rectangle.row  * maze.mapSize + rectangle.col - 1] === 1){ //若与下方单元格连通
                    rectangle.clearRect();
                    rectangle.x -= 30;
                    rectangle.col -= 1;
                    ctx_rect.fillRect(rectangle.x,rectangle.y,rectangle.len,rectangle.len);
                    e.preventDefault(); //取消事件的默认动作。
                    rectangle.isOver();
                    rectangle.showNextChessBoard();
                }
            }
        }
        if(charCode === 39 || charCode === 68){ //按下 右 键或 D 键
            if(rectangle.col < maze.mapSize){  //若不在第一列
                if(maze.isConnect[rectangle.row * maze.mapSize + rectangle.col][rectangle.row  * maze.mapSize + rectangle.col + 1] === 1){ //若与下方单元格连通
                    rectangle.clearRect();
                    rectangle.x += 30;
                    rectangle.col += 1;
                    ctx_rect.fillRect(rectangle.x,rectangle.y,rectangle.len,rectangle.len);
                    e.preventDefault(); //取消事件的默认动作。
                    rectangle.isOver();
                    rectangle.showNextChessBoard();
                }
            }
        }
    }
};

Rect.prototype.load = function () {
    ctx_rect.fillStyle = 'blue';
    ctx_rect.fillRect(this.x,this.y,this.len,this.len);
    ctx_rect.fillStyle = 'red';
    ctx_rect.fillRect(this.outX,this.outY,this.len,this.len);
    ctx_rect.fillStyle = 'blue';
    rect.addEventListener('keydown',this.doKeyDown,true);
    rect.focus();   //获得键盘焦点
    window.addEventListener('keydown',this.doKeyDown,true);
};

Rect.prototype.clearRect = function () {
    ctx_rect.clearRect(this.x - 1,this.y - 1,this.len + 1,this.len + 1);
};

Rect.prototype.isOver = function () {
    if(this.x >= this.outX && this.y >= this.outY){
        this.isEnd = true;
    }
};

Rect.prototype.showNextChessBoard = function () {
    if(this.isEnd === true){
        maze.mapSize += 3;
        if(maze.mapSize === 23){
            stop();
        }else{
            rectangle.isEnd = false;
            ctx_chess.clearRect(0,0,700,700);
            maze.initialTree();
            maze.initialIsConnect();
            maze.drawChessBoard();
            maze.drawMazeMap();
            rectangle.x = 20;
            rectangle.y = 20;
            rectangle.row = 0;
            rectangle.col = 0;
            rectangle.outX = maze.borderSize * maze.mapSize - 10;
            rectangle.outY = maze.borderSize * maze.mapSize - 10;
            rectangle.load();
        }
    }
};

rectangle.load();
