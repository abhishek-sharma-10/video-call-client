import React, { startTransition, useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import peer from "../services/peer";

export default function Room() {

    const { socket } = useSocket();
    // const { peer, createOffer, answerOffer, setRemoteAnswer, sendStream, remoteStream } = usePeer();
    // const { createOffer, answerOffer, setRemoteAnswer,  } = usePeer();

    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [remoteEmail, setRemoteEmail] = useState();
    const [remoteSocketId, setRemoteSocketId] = useState();

    const handleNewUserJoined = useCallback(
        async (data) => {
            const { emailId, socketId } = data;
            console.log(emailId, socketId);
            // const offer = await createOffer();
            // socket.emit('call-user', { emailId, offer });
            setRemoteSocketId(socketId);

            const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(userStream);

            const offer = await peer.getOffer();
            socket.emit('call-user', { to: socketId, offer });
            // setRemoteEmail(emailId);
            console.log('new User: ', socketId);
        }, [remoteSocketId, socket]
    );

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        console.log("Incoming call from: ", from, offer);
        // setRemoteEmail(from);
        // const answer = await answerOffer(offer);
        // socket.emit('call-accept', { emailId: from, answer });
        setRemoteSocketId(from);

        const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(userStream);

        const answer = await peer.answerOffer(offer);
        socket.emit('call-accept', { to: from, answer });
        console.log('inc: ', from);
    }, [socket]);

    // const handleCallAccepted = useCallback(async ({ from, answer }) => {
    //     console.log('Anser: ', answer);
    //     await peer.setRemoteAnswer(answer);
    // }, [setRemoteAnswer]);

    const sendStream = useCallback(() =>{
        for (const track of stream.getTracks()) {
            peer.peer.addTrack(track, stream)
        }
    }, [stream]);

    const handleCallAccepted = useCallback(async ({ from, answer }) => {
        console.log('Anser: ', answer);
        await peer.setRemoteAnswer(answer);
        sendStream();
    }, [sendStream]);

    // const getUserMedia = useCallback(async () => {
    //     const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    //     setStream(userStream);
    // }, []);

    const handleTrackEvent = useCallback((ev) => {
        const rStreams = ev.streams;
        console.log('GOT TRACKS!!');
        setRemoteStream(rStreams[0]);
    }, []);

    useEffect(() => {
        peer.peer.addEventListener('track', handleTrackEvent);
        return () => {
            peer.peer.removeEventListener('track', handleTrackEvent);
        };
    }, [handleTrackEvent, peer]);

    // const handleNegotiation = useCallback(async () => {
    //     const offer = await peer.createOffer();
    //     console.log('re: ', remoteEmail);
    //     socket.emit('call-user', { emailId: remoteEmail, offer });
    // }, []);

    const handleNegotiation = useCallback(async () => {
        const offer = await peer.getOffer();
        console.log('re: ', remoteSocketId);
        socket.emit('peer-nego-need', { to: remoteSocketId, offer });
    }, [remoteSocketId, socket]);

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegotiation);
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegotiation);
        };
    }, [handleNegotiation]);

    const handlePeerNegoIncoming = useCallback(async ({ from, offer }) => {
        const answer = await peer.answerOffer(offer);
        console.log('Nego inc: ', answer);
        socket.emit('peer-nego-done', { to: from, answer });
    }, [socket]);

    const handlePeerNegoFinal = useCallback(async ({from, answer}) => {
        console.log('Final : ', answer, from);
        await peer.setRemoteAnswer(answer);
    }, []);

    useEffect(() => {
        socket.on('user-joined', handleNewUserJoined);
        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-accepted', handleCallAccepted);
        socket.on('peer-nego-incoming', handlePeerNegoIncoming);
        socket.on('peer-nego-final', handlePeerNegoFinal);

        return () => {
            socket.off('user-joined', handleNewUserJoined);
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted', handleCallAccepted);
            socket.off('peer-nego-final', handlePeerNegoFinal);
        }
    }, [handlePeerNegoFinal, handlePeerNegoIncoming, handleNewUserJoined, handleIncomingCall, handleCallAccepted, socket]);

    // useEffect(() => {
    //     getUserMedia();
    // }, [getUserMedia]);

    return (
        <div>
            <h1>Room here</h1>
            <h5>You are connected with {remoteSocketId}</h5>
            {/* {remoteSocketId ? 'Connected' : 'No connection'} */}
            <button onClick={(e) => sendStream()}>Send Stream</button>
            <div className="videos-container">
                {stream && <ReactPlayer url={stream} playing muted />}
                {remoteStream && <ReactPlayer url={remoteStream} playing muted />}
            </div>
        </div>
    );
}