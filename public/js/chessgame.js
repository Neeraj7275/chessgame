const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
let dragedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = ()=>{
    // chess.board() se chess ka squre aur uska dimension sb kuch mil gata hai jise hm board name ke var me store kiye hue hai print keke hm board ko dekh bhi sakte hai
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach(function(row, rowindex){
        // console.log(row);
        row.forEach(function(square, squareindex){
            // niche vale line se dynamic div bnta hai
            const squareElement = document.createElement("div");
            // niche vale code line me div ko 2 class mil gya hai no 1 is squre and second either light or dark 
            squareElement.classList.add("square",
                (rowindex+squareindex)%2===0 ? "light" : "dark"
            );
            squareElement.dataset.row = rowindex;
            squareElement.dataset.col =squareindex;
            // square hme line no 14 se milta hai jo ki parameter hai
            if(square!=null){
                const pieceElement = document.createElement("div");
                // yha bhi 2 class hai ek to piece name ka and 2nd  white or black name ka
                pieceElement.classList.add("piece",
                    square.color==="w" ? "white" : "black"
                );
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole===square.color;

                pieceElement.addEventListener("dragstart", function(e){
                    if(pieceElement.draggable){
                        dragedPiece=pieceElement;
                        sourceSquare={row: rowindex,col:squareindex};
                        e.dataTransfer.setData("text/plaine","");
                    }
                });
                pieceElement.addEventListener("dragend", function(e){
                         dragedPiece=null;
                         sourceSquare=null;
                });
                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover",function(e){
                e.preventDefault();
            });

            squareElement.addEventListener("drop",function(e){
                e.preventDefault();
                if(dragedPiece){
                    const targetsource = {
                        row:parseInt(squareElement.dataset.row),
                        col:parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourceSquare, targetsource);
                }
            })
            boardElement.appendChild(squareElement);
        });
    });
    if(playerRole=="b"){
       boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }

};

const handleMove = (source,target)=>{
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}` ,
        promotion:"q",
    };
    socket.emit("move",move);

};

const getPieceUnicode = (piece)=>{
    const unicodePieces = {
        p: "♙",
        r: "♖",
        n: "♘",
        b: "♗",
        q: "♕",
        k: "♔",
        P: "♟",
        R: "♜",
        N: "♞",
        B: "♝",
        Q: "♛",
        K: "♚",
    };
    return unicodePieces[piece.type] || "";
};

socket.on("playerRole", function(role){
    playerRole=role;
    renderBoard();
});

socket.on("spectatorRole",function(){
         playerRole=null;
         renderBoard();
});

socket.on("boardStae", function(fen){
    chess.load(fen);
    renderBoard();
});

socket.on("move", function(move){
    chess.move(move);
    renderBoard();
});


renderBoard();