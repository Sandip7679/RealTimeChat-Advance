import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";

let globalStream = null;
const useVideoCallStore = create((set, get) => ({
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  incommingCall: null,
  openVideoCall: false,
  callActive: false,
  permissions:true,
  targetUser:null,
  isRemoteVideoMuted:false,
  isRemoteAudioMuted:false,

  setOpenVideoCall: (openVideoCall) => set({ openVideoCall }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  setPeerConnection: (peer) => set({ peerConnection: peer }),
  setTargetUser:(targetUser)=>set({targetUser}),
  // setRemoteVideoMuted:()=>{
  //   let {remoteStream,isRemoteVideoMuted,isRemoteAudioMuted,targetuser} = get();
  //    if(remoteStream){
  //     let socket = useAuthStore.getState().socket;
  //     socket.emit("isVideoMuted",{isRemoteVideoMuted:!isRemoteVideoMuted,isRemoteAudioMuted,targetuser});
  //    }
  // },
  // setRemoteAudioMuted:()=>{
  //   let {remoteStream,isRemoteVideoMuted,isRemoteAudioMuted,targetuser} = get();
  //   if(remoteStream){
  //    let socket = useAuthStore.getState().socket;
  //    socket.emit("isVideoMuted",{isRemoteVideoMuted,isRemoteAudioMuted:!isRemoteAudioMuted,targetuser});
  //   }
  // },

  createLocalStream: async () => {
      // console.log("Initializing user media stream...");
      try {
         let stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        set({localStream:stream,permissions:true});
      } catch (err) {
        if (err.name === "NotAllowedError") {
          alert("Please enable access to both your camera and microphone through your browser settings to proceed.");
          set({permissions:false});
        } else {
          alert("Error accessing media devices: " + err.message);
        }
      }
    
    
  },
  initializeCall: async () => {
    let socket = useAuthStore.getState().socket;

    socket.on("iceCandidate", async ({ candidate }) => {
      let peerConnection = get().peerConnection;
      if (peerConnection && candidate) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("Added ICE candidate:", candidate);
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    socket.on("offer", async ({ offer, from, data }) => {
      console.log("Incoming call from:", from);
      set({ incommingCall: { offer, from, data }, openVideoCall: true, targetUser:data });
    });

    // socket.on("answer", async ({ answer }) => {
    //   let peerConnection  = get().peerConnection;
    //   if (peerConnection) {
    //     await peerConnection.setRemoteDescription(answer);
    //   }
    // });
    // socket.off("answer");
    socket.on("answer", async ({ answer }) => {
      let peerConnection = get().peerConnection;

      if (!peerConnection) {
        console.warn("PeerConnection is not initialized yet.");
        return;
      }

      if (peerConnection.signalingState === "stable") {
        console.warn(
          "Skipping setRemoteDescription because the connection is already stable."
        );
        return;
      }

      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        console.log("Remote description set successfully.");
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    });

    socket.on("videoMuted",async ({isRemoteVideoMuted,isRemoteAudioMuted})=>{
        set({isRemoteVideoMuted,isRemoteAudioMuted});
    });
    socket.on("callEnded",async ()=>{
      await get().endCall();
    });
  },

  callUser: async () => {
    let socket = useAuthStore.getState().socket;
    const userData = useAuthStore.getState().authUser;

    const { localStream, setRemoteStream, setPeerConnection,targetUser } = get();

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    setPeerConnection(peerConnection);
    // console.log('peerConnection...',peerConnection)

    localStream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", { to: targetUser?._id, candidate: event.candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      // console.log(
      //   "remotestreem in callUser event.streams[0]...",
      //   event.streams[0]
      // );
      setRemoteStream(event.streams[0]);
    };

    set({ callActive: true });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit("offer", { from: userData._id, offer, to: targetUser?._id, data: userData});
  },

  // answerCall: async ()=>{
  //   let socket = useAuthStore.getState().socket;
  //   const {incommingCall,localStream, peerConnection} = get();

  //   // const peerConnection = new RTCPeerConnection();
  //     let pc = peerConnection;

  //     if (!pc || pc?.connectionState === "closed"){
  //       console.log('pc.connectionState...',pc?.connectionState === "closed");
  //       pc = new RTCPeerConnection({
  //         iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  //       });

  //       set({ peerConnection:pc });

  //       localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  //       pc.ontrack = (event) => {
  //         console.log('remotestreem in answerCall event.streams[0]...',event.streams[0]);
  //         set({ remoteStream: event.streams[0] });
  //       };
  //     }

  //     if (pc.signalingState !== "stable") {
  //       console.warn("PeerConnection is already stable, skipping setRemoteDescription");
  //       await pc.setRemoteDescription(new RTCSessionDescription(incommingCall.offer));
  //     }else {
  //       console.warn("Skipping setRemoteDescription because the connection is already stable.");
  //     }

  //     // await pc.setRemoteDescription(incommingCall.offer);
  //     const answer = await pc.createAnswer();
  //     await pc.setLocalDescription(answer);
  //     // set({ peerConnection:pc });

  //     socket.emit("answer", { answer, to: incommingCall.from });
  // }

  answerCall: async () => {
    let socket = useAuthStore.getState().socket;
    const { incommingCall, localStream, peerConnection } = get();
    // createLocalStream();

    let pc = peerConnection;

    if (!pc || pc?.connectionState === "closed") {
      console.log("Creating new PeerConnection...");
      pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      set({ peerConnection: pc });

      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));

      pc.ontrack = (event) => {
        console.log("Remote stream in answerCall:", event.streams[0]);
        set({ remoteStream: event.streams[0] });
        // let track = event.track;
        // if (track.kind === "video") {
        //   track.onmute = () => {
        //     console.log("Remote video track is muted");
        //   };
      
        //   track.onunmute = () => {
        //     console.log("Remote video track is unmuted");
        //   };
        // }
      };
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          to: incommingCall.from,
          candidate: event.candidate,
        });
      }
    };

    if (pc.signalingState !== "have-remote-offer") {
      try {
        // console.log("Setting remote description...");
        await pc.setRemoteDescription(
          new RTCSessionDescription(incommingCall.offer)
        );
        // console.log("Remote description set successfully.");
      } catch (error) {
        console.error("Error setting remote description:", error);
        return; 
      }
    }

    if (pc.signalingState === "have-remote-offer") {
      try {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        // console.log("Answer created and set successfully.");
        set({ callActive: true });
        socket.emit("answer", { answer, to: incommingCall.from });
      } catch (error) {
        console.error("Error creating answer:", error);
      }
    } else {
      console.warn(
        "Skipping createAnswer() because signaling state is incorrect:",
        pc.signalingState
      );
    }
  },
  endCall: () => {
    const { peerConnection, setRemoteStream, setPeerConnection, targetUser, incommingCall} = get();
    if (!get().callActive && !incommingCall) return;
    let socket = useAuthStore.getState().socket;
    // let selectedChat = useChatStore.getState().selectedChat;

    if (peerConnection) {
        peerConnection.close();
        setPeerConnection(null);
    }

    setRemoteStream(null);

    // const to = incommingCall? incommingCall.data?._id : selectedChat?.memberIds?.[0]?._id;
    socket.emit("call-ended",{to:targetUser._id});
    set({incommingCall:null});
    set({ callActive: false });
}

}));

export default useVideoCallStore;
