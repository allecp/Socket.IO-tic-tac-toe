import React from 'react';
import { useState } from 'react';
import '../Styles/Menu.css';

const Menu = ({room,joinRoom,handleRoomChange,error}) => {


  return (

    <form onSubmit={joinRoom}>
        <input style = {{margin:"0px"}}placeholder = "Enter room" value = {room} onChange = {(event) => handleRoomChange(event.target.value)}>
        </input>
        {error === "empty" && <div className = "error">Please enter a valid room.</div>}
        {error === "full" && <div className = "error">Game in progress... Please enter another room.</div>}
        <button style = {{padding:'1px'}}>Join Room</button>
    </form>
    

    
  )
}

export default Menu