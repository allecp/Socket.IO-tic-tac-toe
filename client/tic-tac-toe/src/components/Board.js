import React from 'react';
import {useState,useEffect} from 'react'; 
import Tile from './Tile';
import { FaTimes } from 'react-icons/fa';
import { FaRegCircle } from 'react-icons/fa';
import '../Styles/Board.css';
import toast, { Toaster } from 'react-hot-toast';



const Board = ({socket,name,room,leaveRoom}) => {

  const [symbol,setSymbol] = useState(null);
  const [turn,setTurn] = useState(null);
  const [winner,setWinner] = useState('');
  const [board,setBoard] = useState([{id:0, value:""},{id:1, value:""},{id:2, value:""},{id:3, value:""},{id:4, value:""},{id:5, value:""},{id:6, value:""},{id:7, value:""},{id:8, value:""}]);

  function resetBoard(){

    let newBoard = [];
    for (let i = 0; i < 9; i++)
        newBoard.push({id:i,value:""});

    return newBoard;
  }

  useEffect(() => {

    socket.on('set-symbol',(char) => {
      console.log("in here!");
      setSymbol(char);
    });

    socket.emit("join-room",room);

    socket.on("rematch", () => {
      setBoard(resetBoard());
      setWinner('');
      toast("REMATCH!");
    })

    socket.on('turn-change',(newTurn) => {
      setTurn(newTurn);
    })

    socket.on('set-turn',(newTurn) => {
      setTurn(newTurn);
    });

    socket.on("board-change",(newBoard) => {
        console.log(newBoard);
        setBoard(newBoard); 
    });

    socket.on("opp-joined-game", (id) => {
      let message = (id === socket.id) ? "BEGIN MATCH!" : "An opponent has joined. BEGIN MATCH!";  
      
      toast.success(message, {
          iconTheme:{
            primary: '#14bdac'
          }
        })
    })

    socket.on('opp-left-room',() => {
      setSymbol('X'); 
      setTurn(null); 
      setBoard(resetBoard()); 
      setWinner('');
      toast.error(`Opponent has left the game`,{
        iconTheme:{
          primary:"black"
        }
      });
      //alert('Opponent has left the room');  
    })

    return () => {
      socket.off("set-symbol");
      socket.off("set-turn");
      socket.off("turn-change");
      socket.off("board-change");
      socket.off("opp-left-room");
      socket.off("opp-joined-game");
      socket.off("rematch");
      socket.off("join-room");
    }
  },[])

  const changeTurn = () => {
    socket.emit('turn-change',{room:room,newTurn: turn === 'X' ? 'O' : 'X'});
  }

  const handleTileClick = (id) => {
    
    if (board[id].value != "")
      return;
    
    const newBoard = board.map((tile) => id === tile.id ? {...tile,value : turn} : {...tile})

    socket.emit("board-change",{newBoard,room:room});
    changeTurn();
  }

  // terminating conditions win,lose,tie
  useEffect(() => {
    let cnt = 0;
    // check rows

    for (let row = 0; row < 3; row++)
    {
        for (let col = 0; col < 3; col++)
        {
            if (board[(3 * row) + col].value === 'X'){
              cnt++;
            }

            if (board[(3 * row) + col].value === 'O'){
              cnt--;
            } 
        }

        if (cnt === 3){
          setWinner('X wins!')
          //console.log("X row");
        }
        
        if (cnt === -3){
          setWinner('O wins!')
          //console.log('O row')
        }

        cnt = 0;
    }

    cnt = 0; 
    // check cols 
    for (let row = 0; row < 3; row++)
    {
        for (let col = 0; col < 3; col++)
        {
            if (board[(col * 3) + row].value === 'X'){
              cnt++;
            }

            if (board[(col * 3) + row].value === 'O'){
              cnt--;
            }
        }

        if (cnt === 3){
          setWinner('X wins!')
        //console.log('X column')
        }
        
        if (cnt === -3){
          setWinner('O wins!')
          //console.log('O column')
        }

        cnt = 0;
    }

    cnt = 0; 

    // diagonal 1  0 4 8
    
    for (let col = 0; col < 3; col++){

      if (board[3 * col + col].value === 'X')
        cnt++;

      if (board[3 * col + col].value === 'O')
        cnt--;
        

      if (cnt === 3){
        setWinner('X wins!'); 
        //console.log('X diagonal1')
      }

      if (cnt === -3){
        setWinner('O wins!'); 
        //console.log('O diagonal1')
        }
    }

    cnt = 0;

    // diagonal 2   2  4  6 
    for (let col = 1; col <= 3; col++){

        if (board[2 * col].value === 'X')
          cnt++; 

        if (board[2 * col].value === 'O')
          cnt--;
    }

    if (cnt === 3){
      //console.log("X diagonal 2"); 
      setWinner('X wins!')
    }

    if (cnt === -3){
      //console.log("O diagonal 2")
      setWinner("O wins!")
    }

    let emptyTiles = 0;

    for (let i = 0; i < 9; i++){
        if (board[i].value === ''){
          emptyTiles++;
        }
    }

    // no empty tiles and no winner == draw
    if (emptyTiles === 0){
      setWinner('Draw');
    }
      

  },[board])

  // make socket leave room that they are in but connection still intact
  // the other socket in the same room will have its state reset
  const handleLeaveRoomClick = () => {
      socket.emit("leave-room",room);
      leaveRoom();
  }

  const handleRematchClick = () => {
      socket.emit("rematch",room);
  }


  return (
    <div className = "board-container">
        <Toaster/>
        <div className = "header">
          <div className = "button-container">
              {winner && <button onClick = {handleRematchClick}>Rematch</button>}
              <button style = {{marginLeft:"5px"}} onClick = {handleLeaveRoomClick}>Leave game</button>
          </div>
        </div>
        
      {!winner &&
        <div style = {{textAlign:"center"}}>{turn === null ? "Waiting for opponent..." : (turn === symbol ? "Your turn" : `${turn}'s turn`)}
        </div>} 

      {winner && <div className = "endMessage">{winner}</div>}

      <div className = "legend">
        <div className = "you">
          <span style = {{marginRight:"10px"}}>You</span>
          {symbol === 'X' ? <FaTimes fontSize= "30px"/> : <FaRegCircle color = "white" fontSize = "30px"/>}
        </div>
        <div className = "opp">
          <span style = {{marginRight:"10px"}}>Opponent  </span>
          {symbol === 'X' ? <FaRegCircle color = "white" fontSize = "30px"/> : <FaTimes fontSize = "30px"/>}
        </div>
      </div>


      <div className = {`board${turn === symbol && turn && !winner ? "" : " inactive"}`}>
        {
          board.map((tile) => <Tile key = {tile.id} handleTileClick = {() => handleTileClick(tile.id)} value = {tile.value} icon = {turn} symbol = {symbol} ></Tile>)
        }
      </div>
  </div>

  )
}

export default Board