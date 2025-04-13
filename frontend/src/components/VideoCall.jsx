import { useEffect, useRef, useState } from "react";
import useVideoCallStore from "../store/useVideoCallStore";
import { Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const VideoCall = () => {
  const MyVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [isAudioMuted, setisAudioMuted] = useState(false);
  const [isVideoMuted, setisVideoMuted] = useState(false);
  const {
    localStream,
    remoteStream,
    callUser,
    incommingCall,
    answerCall,
    setOpenVideoCall,
    callActive,
    endCall,
    createLocalStream,
    permissions,
    setLocalStream,
    targetUser,
    isRemoteVideoMuted,
    isRemoteAudioMuted,
    // setRemoteVideoMuted,
    // setRemoteAudioMuted
  } = useVideoCallStore();
  const { authUser,socket } = useAuthStore();

  useEffect(() => {
    createLocalStream();
  }, []);

  useEffect(() => {
    console.log("targetUser in useEffect...", targetUser);
    console.log("localStream", localStream);
    if (MyVideoRef.current && localStream) {
      MyVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    // console.log("Remote video ref:", remoteVideoRef.current);
    // console.log("Remote stream in useEffect:", remoteStream);
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      // setIsCalling(false);
    }
  }, [remoteStream]);

  const onCloseVideoCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      setOpenVideoCall(false);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isAudioMuted;
      });
      if(remoteStream){
           socket.emit("isVideoMuted",{isRemoteVideoMuted:isVideoMuted,isRemoteAudioMuted:!isAudioMuted, targetUser});
       }
      setisAudioMuted((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoMuted;
      });

      if(remoteStream){
        socket.emit("isVideoMuted",{isRemoteVideoMuted:!isVideoMuted,isRemoteAudioMuted:isAudioMuted, targetUser});
       }
      setisVideoMuted((prev) => !prev);
    }
  };

  // const isRemoteVideoMuted = remoteStream
  // ?.getVideoTracks()
  // ?.every((track) => !track.enabled);

  return (
    <div className="fixed inset-0 flex justify-center items-center h-screen w-screen bg-black bg-opacity-90 z-10">
      <div className="flex flex-col items-center p-4">
        <h2 className="text-xl font-bold mb-4">Video Call</h2>
        <div className="sm:flex gap-8">
          <div>
            <div className="w-[200px] h-[220px] border rounded-lg flex flex-col items-center justify-center">
              <div className="w-48 h-48 flex flex-col items-center justify-cente">
               {/* {console.log('MyVideoRef.current.srcObject...',MyVideoRef.current?.srcObject)} */}
                <video
                  ref={MyVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`${
                    (isVideoMuted || !localStream )? "w-0 h-0" : "w-48 h-44"
                  }`}
                />
                {isVideoMuted && (
                  <div className="w-48 h-44 flex flex-col items-center justify-center">
                    <img
                      className="size-16 object-cover rounded-full"
                      src={authUser?.profilePic || "/avatar.png"}
                    />
                    <p className="text-md sm:text-xl text-center truncate max-w-44">
                      {authUser?.fullName}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex self-end gap-4 pr-2 pb-2">
                <button onClick={toggleAudio} className="p-1 rounded-full">
                  {isAudioMuted ? (
                    <MicOff className="w-5 h-5 text-red-500" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                <button onClick={toggleVideo} className="p-1 rounded-full">
                  {isVideoMuted ? (
                    <VideoOff className="w-5 h-5 text-red-500" />
                  ) : (
                    <Video className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!localStream && (
                <button
                  onClick={() => {
                    setLoading(true);
                    createLocalStream();
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 cursor-pointer"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Retrying..." : "Retry"}
                </button>
              )}
            </div>
            <p className="text-center text-md sm:text-lg mb-5">You</p>
          </div>
          {remoteStream ? (
            <div className="w-[200px] h-[220px] border rounded-lg flex flex-col items-center justify-center">
              {/* {console.log('remoteVideoRef.current.srcObject...',remoteVideoRef.current.srcObject)} */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className={isRemoteVideoMuted?"w-0 h-0":"w-48 h-48"}
                />
                  {isRemoteVideoMuted && (
                  <div className="w-48 h-44 flex flex-col items-center justify-center">
                    <img
                      className="size-16 object-cover rounded-full"
                      src={targetUser?.profilePic || "/avatar.png"}
                    />
                    <p className="text-md sm:text-xl text-center truncate max-w-44">
                      {targetUser?.fullName}
                    </p>
                  </div>
                )}
                <div className="flex self-end gap-4 pr-2 pb-2">
                <button  className="p-1 rounded-full cursor-default">
                  {isRemoteAudioMuted ? (
                    <MicOff className="w-5 h-5 text-red-500" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                <button  className="p-1 rounded-full cursor-default">
                  {isRemoteVideoMuted ? (
                    <VideoOff className="w-5 h-5 text-red-500" />
                  ) : (
                    <Video className="w-5 h-5" />
                  )}
                </button>
              </div>
                {/* <img
                  className="size-16 object-cover rounded-full"
                  src={targetUser?.profilePic || "/avatar.png"}
                />
              <p className="text-center text-md sm:text-lg">
                {targetUser?.fullName}
              </p> */}
            </div>
          ) : (
            <div className="w-[200px] h-[220px] border rounded-lg flex flex-col items-center justify-center">
              {!incommingCall && (
                <div className="flex flex-col items-center justify-center">
                  <img
                    className="size-16 object-cover rounded-full"
                    src={targetUser?.profilePic || "/avatar.png"}
                  />
                  <p className="text-md sm:text-xl text-center truncate max-w-44">
                    {targetUser?.fullName}
                  </p>
                  <button
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-700 mt-5"
                    disabled={callActive}
                    onClick={() => {
                      // setIsCalling(true);
                      callUser();
                      socket.emit("isVideoMuted",{isRemoteVideoMuted:isVideoMuted,isRemoteAudioMuted:isAudioMuted, targetUser});
                    }}
                  >
                    {callActive ? "Calling" : "Call"}
                  </button>
                </div>
              )}

              {incommingCall && (
                <div className="flex flex-col items-center justify-center">
                  <img
                    className="size-16 object-cover rounded-full"
                    src={incommingCall.data?.profilePic || "/avatar.png"}
                  />
                  <p className="text-md sm:text-xl text-center truncate max-w-44">
                    {incommingCall.data?.fullName}{" "}
                  </p>
                  <p className="text-white text-md sm:text-lg mt-3">Calling</p>

                  {!callActive ? (
                    <button
                      className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-700 mt-5"
                      disabled={isCallAccepted}
                      onClick={()=>{
                       answerCall();
                       socket.emit("isVideoMuted",{isRemoteVideoMuted:isVideoMuted,isRemoteAudioMuted:isAudioMuted, targetUser}); 
                      }}
                    >
                      Accept
                    </button>
                  ) : (
                    // <p className="text-white">Connecting...</p>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex space-x-2">
          {callActive ? (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => endCall()}
            >
              End Call
            </button>
          ) : (
            <button
              className="bg-gray-950 text-white px-4 py-2 rounded"
              onClick={onCloseVideoCall}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
