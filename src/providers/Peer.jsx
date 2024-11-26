import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

const PeerContext = createContext();

export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = (props) => {

    const [remoteStream, setRemoteStream] = useState(null);

    const peer = useMemo(() => new RTCPeerConnection({
        iceServers: [
            {
                urls: ['stun:stun.l.google.com:19302', 'stun:global.stun.twilio.com:3478'],
            }
        ]
    }), []);

    const createOffer = async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    }

    const answerOffer = async (offer) => {
        peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    };

    const setRemoteAnswer = async (answer) => {
        peer.setRemoteDescription(answer);
    }

    const sendStream = async (stream) => {
        const tracks = stream.getTracks();
        for (const track of tracks) {
            peer.addTrack(track, stream);
        }
    }

    const handleTrackEvent = useCallback((ev) => {
        const streams = ev.streams;
        setRemoteStream(streams[0]);
    }, []);

    useEffect(() => {
        peer.addEventListener('track', handleTrackEvent);

        return () => {
            peer.removeEventListener('track', handleTrackEvent);
        };
    }, [handleTrackEvent, peer]);

    return (
        <PeerContext.Provider value={{ peer, createOffer, answerOffer, setRemoteAnswer, sendStream, remoteStream }}>
            {props.children}
        </PeerContext.Provider>
    );
}