import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import Client from "../componenets/Client";
import Editor from "../componenets/Editor";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { initSocket } from "../socket";
import ACTIONS from "../Actions";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const [clients, setClient] = useState([]);

  useEffect(() => {
    console.log("mkksdfa");
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("cunnect_error", (err) => handleErrors(err));
      socketRef.current.on("cunnect_failed", (err) => handleErrors(err));
      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("socket connection failed, try again later");
        reactNavigator("/");
      }

      console.log("inside init", socketRef.current);
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      //listening for joined event
      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room.`);
          console.log("${username} joined");
        }
        setClient(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
         code: codeRef.current,
         socketId,
        });
      });

      //Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED,({socketId,username}) => {
        toast.success(`${username} left the room.`);
        setClient((prev) => {
          return prev.filter(client => client.socketId !== socketId);
        })
      })
    };
    init();
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    }
  }, []);

  async function copyRoomId() {
    try{
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been copied to clipboard');
    } catch(err) {
      toast.error('Could not copy the Room ID')
      toast.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator('/');

  }

  if (!location.state) {
    return <Navigate to="/" />;
  }
  <Navigate />;

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/code-sync.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>

        <button className="btn copyBtn" onClick={copyRoomId}>Copy ROOM ID</button>
        <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
      </div>
      <div className="editorWrap">
        <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => {codeRef.current=code}} />
      </div>
    </div>
  );
};
export default EditorPage;
