const express = require("express");
const app = express();
const path = require("path");

const socket = require("socket.io");
const http = require("http");
const {Chess} = require("chess.js");

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();

let players = {};
let currentplayer = "w";

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res){
    res.render("index", {title:"Custom Chess Game"});
});

io.on("connection", function(uniquesocket){
    console.log("connected");
    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole","w");
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    }
    else{
        uniquesocket.emit("spectatorRole");
    }

    uniquesocket.on("disconnect",function(){
        console.log("disconnected");
        if(uniquesocket.id===players.white){
            delete players.white;
        }
        if(uniquesocket.id===players.black){
            delete players.black;
        }
    });

    uniquesocket.on("move",function(move){
        try{
            if(chess.turn()==="w" && uniquesocket.id!==players.white) return;
            if(chess.turn()==="b" && uniquesocket.id!==players.black) return;

            const result = chess.move(move);

            if(result){
                currentplayer = chess.turn();
                io.emit("move", move);
                io.emit("boardstate", chess.fen());
            }
            else{
                console.log("envalid move");
                uniquesocket.emit("invalid", move);
            }
        }
        
        catch(err){
            console.log("error");
            uniquesocket.emit("invalidmove", move);
        }
    })
});

server.listen(3000, function(){
    console.log("server on port 3000");
});
