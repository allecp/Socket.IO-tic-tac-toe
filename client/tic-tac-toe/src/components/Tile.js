import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { FaRegCircle } from 'react-icons/fa';

const Tile= ({handleTileClick,value,id,icon,symbol}) => {
  return (
    <div className = "tile" onClick = {handleTileClick}>
      <div className = "icon">
          {value === 'X' && <FaTimes fontSize= "50px"/>}
          {value === 'O' && <FaRegCircle fontSize = "50px" color = "white"/>}
      </div>
   </div>
  )
}

export default Tile