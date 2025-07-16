import { useState } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuid();
    setRoomId(id);
    toast.success("Room ID generated!");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both fields are required");
      return;
    }

    navigate(`/chatroom/editor/${roomId}`, {
      state: { username },
    });

    toast.success("Room joined successfully!");
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div>
      <div>
        <img src="/images/codecast.png" alt="Logo" />
        <h4>Enter the ROOM ID</h4>

        <div>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="ROOM ID"
            onKeyUp={handleInputEnter}
          />
        </div>
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="USERNAME"
            onKeyUp={handleInputEnter}
          />
        </div>
        <button onClick={joinRoom}>JOIN</button>

        <p>
          Don't have a room ID? create{' '}
          <span onClick={generateRoomId} style={{ cursor: 'pointer' }}>
            New Room
          </span>
        </p>
      </div>
    </div>
  );
}

export default Home;
