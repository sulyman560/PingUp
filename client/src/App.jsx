import React, { useRef } from 'react'
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
import toast, { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import axios from 'axios';
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice'
import { fetchConnections } from './features/connections/connectionsSlice'
import { addMessages } from './features/message/messageSlice'
import Notification from './components/Notification'
import { useLocation } from 'react-router-dom';

const App = () => {
  const location = useLocation();
  const pathnameRef = useRef(location.pathname)
  const { user } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch()
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        //getToken({ template: 'default' }).then((token) => console.log(token));
        const token = await getToken()
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))
      }
    }
    fetchData()
  }, [user, getToken, dispatch]);
  useEffect(()=>{
    pathnameRef.current = location.pathname
  },[location])

  useEffect(()=>{
    if (user) {
      const eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' + user.id);

      eventSource.onmessage = (event)=>{
        const message = JSON.parse(event.data)

        if (pathnameRef.current === ('/messages/' + message.from_user_id._id)) {
          dispatch(addMessages(message))
        }else{
          toast.custom((t)=>(
            <Notification t={t} message={message} />
          ), {position: 'bottom-right'})
        }
      }
    }
  },[user, dispatch])

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
