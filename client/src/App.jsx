import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Login from './pages/Login'
import { useUser, useAuth } from '@clerk/clerk-react'
import Layout from './pages/Layout'
import {Toaster} from 'react-hot-toast'
import { useEffect } from 'react'
import axios from 'axios';

const App = () => {
    const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Get JWT from Clerk
        getToken({ template: 'default' }).then((token) => console.log(token));

        // Call backend with JWT in Authorization header
        const res = await axios.get('http://localhost:4000/api/user/data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();
  }, [user]);
  return (
    <>
    <Toaster />
      <Routes>
        <Route path='/' element={!user ? <Login /> : <Layout />} >
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<ChatBox />} />
          <Route path='connections' element={<Connections />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:userId' element={<Profile />} />
          <Route path='create-post' element={<CreatePost />} />
        </Route>

      </Routes>
    </>
  )
}

export default App
