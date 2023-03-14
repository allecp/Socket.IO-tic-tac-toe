
import { useState, useEffect } from 'react'; 
import Menu from './components/Menu';
import Board from './components/Board';
import { io } from 'socket.io-client';
import './Styles/App.css';

const socket = io.connect('https://tictactoe-api-swfp.onrender.com');

function App() {
  const [showBoard,setBoard] = useState(false);
  const [room,setRoom] = useState('');
  const [error,setError] = useState('');

  useEffect(() => {
    socket.on("room-size",(isFull,roomState) => {
      console.log(`room-size event listener room:${roomState}`);
      console.log(isFull);
      if (!isFull){
          setBoard(!showBoard);
      }
      else{
          setError("full");
          console.log("room is full");
      }
  });
      return () => {
          socket.off("room-size");
      }
  },[])

  function joinRoom(event){
    event.preventDefault();
    //console.log(room);

    if (room === '')
    {
      setError('empty');
      return;
    }

    //setBoard(!showBoard);
    socket.emit("check-room-capacity",room);
    //socket.emit("join-room",room);
  }

  function leaveRoom(){
    setBoard(false);
    setError('');
    setRoom('');
  }

  function handleRoomChange(newState){
    setRoom(newState);
  }

  return (
    <div className = "container">
        { showBoard ? 
          <Board socket = {socket} room = {room} leaveRoom = {leaveRoom}></Board> 
                :
          <Menu room = {room} joinRoom = {joinRoom} handleRoomChange = {handleRoomChange} error = {error}></Menu>
        }
    </div>
  );
}

export default App;
