import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const { socket } = useSocket();
    const [email, setEmail] = useState();
    const [room, setRoom] = useState();
    const navigate = useNavigate();

    // socket.emit('join-room', {roomId: '123', emailId: 'abc@gmail.com'});
    // console.log(socket);

    const handleJoinedRoom = useCallback(({ roomId }) => {
        console.log(roomId);
        navigate(`/room/${roomId}`);
    }, [navigate]);

    useEffect(() => {
        socket.on('joined-room', handleJoinedRoom);
        return () => {
            socket.off('joined-room', handleJoinedRoom);
        };
    }, [handleJoinedRoom, socket]);

    const handleJoinRoom = () => {
        socket.emit('join-room', { roomId: room, emailId: email });
    };

    return (
        <div className="home-container">
            <div className="form-container">
                <input type="email" placeholder="Enter your email here" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="text" placeholder="Enter Room Code" value={room} onChange={e => setRoom(e.target.value)} />
                <button onClick={handleJoinRoom}>Join Room</button>
            </div>
        </div>
    );
}