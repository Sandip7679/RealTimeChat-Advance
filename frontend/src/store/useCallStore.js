import { create } from "zustand";
// import Peer from "simple-peer";
import { useAuthStore } from "./useAuthStore";



// const socket = useAuthStore.getState().socket;
// const userId = useAuthStore.getState().authUser;

// export const useCallStore = create(() => ({
//     me: "",
//     stream: null,
//     call: null,
//     callAccepted: false,
//     connectionRef: null,

//     setMe: (id) => set({ me: id }),
//     setStream: (stream) => set({ stream }),
//     setCall: (call) => set({ call }),
//     setCallAccepted: (status) => set({ callAccepted: status }),

//     initializeIncomingCall: () => {
//         // socket.on("me", (id) => set({ me: id }));
//         socket.on("callIncoming", ({ from, signal }) => set({ call: { from, signal } }));
//     },

//     callUser: (id) => {
//         const {stream } = get();
//         const peer = new Peer({ initiator: true, trickle: false, stream });

//         peer.on("signal", (data) => {
//             socket.emit("callUser", { userToCall: id, signalData: data, from: socket.id });
//         });

//         peer.on("stream", (userStream) => {
//             set({ remoteStream: userStream });
//         });

//         socket.on("callAccepted", (signal) => {
//             set({ callAccepted: true });
//             peer.signal(signal);
//         });

//         set({ connectionRef: peer });
//     },

//     answerCall: () => {
//         const { call, stream } = get();
//         set({ callAccepted: true });

//         const peer = new Peer({ initiator: false, trickle: false, stream });

//         peer.on("signal", (data) => {
//             socket.emit("answerCall", { signal: data, to: call.from });
//         });

//         peer.on("stream", (userStream) => {
//             set({ remoteStream: userStream });
//         });

//         peer.signal(call.signal);
//         set({ connectionRef: peer });
//     }
// }));

const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // Google STUN server
};

const useCallStore = create((set, get) => ({
    openVideoCall:false,
    stream: null,
    remoteStream: null,
    peerConnection: null,
    call: null,
    setOpenVideoCall:(openVideoCall)=>set({openVideoCall}),
    setStream: (stream) => set({ stream }),
    // iceCandidatesQueue: [], // Buffer ICE candidates

    initializeSocket: () => {
        // socket.on("connect", () => console.log("Connected to socket:", socket.id));
        let socket = useAuthStore.getState().socket;
        socket.on("callIncoming", async ({ from, offer }) => {
            console.log('callIncoming.....');
            set({openVideoCall:true, call: { from, offer }});
            // set({openVideoCall:true});
            // set({ call: { from, offer } });
        });

        socket.on("callAnswered", ({ answer }) => {
            const peer = get().peerConnection;
            if(peer){
                peer.setRemoteDescription(new RTCSessionDescription(answer));
            }else{
                console.log('no peer in callAnswered...');
            }
        });

        socket.on("iceCandidate", ({ candidate }) => {
            // console.log('peerConnection...',peerConnection);
            const peer = get().peerConnection;
            if(peer){
                peer.addIceCandidate(new RTCIceCandidate(candidate));
            }else{
                console.log('no peer in iceCandidate..');
                // set((state) => ({
                //     iceCandidatesQueue: [...state.iceCandidatesQueue, candidate],
                // }));
            }
        });
    },

    // processQueuedIceCandidates: () => {
    //     const peer = get().peerConnection;
    //     if (peer) {
    //         get().iceCandidatesQueue.forEach((candidate) => {
    //             peer.addIceCandidate(new RTCIceCandidate(candidate)).catch((err) =>
    //                 console.error("Error adding queued ICE candidate:", err)
    //             );
    //         });
    //         set({ iceCandidatesQueue: [] }); // Clear queue after processing
    //     }
    // },

    callUser: async (to) => {
        // set({openVideoCall:true});
        const socket = useAuthStore.getState().socket;
        const userId = useAuthStore.getState().authUser;
        const { stream } = get();
        const peer = new RTCPeerConnection(iceServers);
        console.log('peer...',peer);
        set({ peerConnection: peer });

        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("iceCandidate", {to: to, candidate: event.candidate });
            }
        };

        peer.ontrack = (event) => {
            set({ remoteStream: event.streams[0] });
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        console.log('emit.socket....');
        
        socket.emit("callUser", {from:userId, to: to, offer });
        // get().processQueuedIceCandidates();
    },

    answerCall: async () => {
        const socket = useAuthStore.getState().socket;
        const { call, stream } = get();
        const peer = new RTCPeerConnection(iceServers);
        set({ peerConnection: peer });

        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("iceCandidate", { to: call.from, candidate: event.candidate });
            }
        };

        peer.ontrack = (event) => {
            set({ remoteStream: event.streams[0] });
        };

        await peer.setRemoteDescription(new RTCSessionDescription(call.offer));

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        console.log('peer in answerCall',peer);

        socket.emit("answerCall", { to: call.from, answer });
    }
}));

export default useCallStore;
