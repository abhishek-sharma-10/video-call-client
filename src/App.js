import logo from './logo.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import Room from './pages/Room';

import { SocketProvider } from './providers/Socket';
import { PeerProvider } from "./providers/Peer";

function App() {
  return (
    <div className="App">
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/room/:roomId' element={<Room />} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
