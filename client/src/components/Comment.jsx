import { Cross, CrossIcon, Heart, MessageCircle, SendHorizonal, Share2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { dummyPostsData, dummyUserData } from '../assets/assets'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../api/axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const Comment = ({ post, posts, setPosts, likes, setLikes, comments, setComments, comment, setComment }) => {

  const [newComment, setNewComment] = useState("");
  const { getToken } = useAuth()
  const currentUser = useSelector((state) => state.user.value)
  const user = dummyUserData
  //const post = dummyPostsData
  const navigate = useNavigate()

  const fetchlike = async () => {
    try {
      const { data } = await api.post(`/api/post/getpost`, { postId: post._id }, { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) {
        setPosts(data.post.likes_count)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchlike()
  }, [])
  const handleLike = async () => {
    try {
      const { data } = await api.post(`/api/post/like`, { postId: post._id }, { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) {
        toast.success(data.message)
        setLikes(prev => {
          if (prev.includes(currentUser._id)) {
            return prev.filter(id => id !== currentUser._id)
          } else {
            return [...prev, currentUser._id]
          }
        })
      } else {
        toast(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.post(`api/post/getComment`, { postId: post._id }, { headers: { Authorization: `Bearer ${await getToken()}` } });
        if (data.success) setComments(data.comments);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComments();
  }, [post._id, getToken]);
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { data } = await api.post(
        `/api/post/comment`,
        { postId: post._id , content: newComment },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setComments(data.comments);
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment");
    }
  };

  return (
    <div onClick={() => setComment(false)} className='flex flex-col h-screen fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50'>
      <div onClick={(e) => e.stopPropagation()} className="md:px-10 h-full overflow-y-scroll flex flex-col gap-4 m-auto p-5 py-5 w-80 sm:w-[800px] rounded-lg shadow-xl border border-gray-200 bg-white">
        <h1 className='text-center text-xl font-semibold text-gray-800'>{post.user.full_name}'s post</h1>


        <div onClick={() => navigate('/profile/' + post.user._id)} className='border-t cursor-pointer flex items-center gap-2 p-2 md:px-10 bg-gradient-to-r from-indigo-50 to-purple-50 
                border-gray- 300'>
          <img src={post.user.profile_picture} className='size-8 rounded-full' alt="" />
          <div>
            <p className='font-medium'>{post.user.full_name}</p>
            <div className='text-gray-500 text-sm'>
              @{post.user.username} • {moment(post.createdAt).fromNow()}
            </div>
          </div>
        </div>
        <div>

        </div>
        {/* Image */}
        <div className='grid grid-cols-2 gap-2'>
          {post.image_urls.map((img, index) => (
            <img src={img} key={index} className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && 'col-span-2 h-auto'}`} alt="" />
          ))}
        </div>
        {/* Image */}
        <div className='flex justify-between items-center gap-4 text-gray-600 text-sm pt-2 border-t border-b border-gray-300'>
          <div className='flex flex-col items-start gap-1'>
            <div className='flex items-center gap-1'>
              {posts.length > 0 && (
                <p className="text-xs text-gray-500">
                  {posts.slice(0, 3).map((user) => user.full_name).join(", ")}
                </p>
              )
              }
              {posts.length > 3 && (
                <span className="text-xs text-gray-500"> +{posts.length - 3} more</span>
              )}

            </div>

            <div onClick={handleLike} className='cursor-pointer flex items-center gap-1'>
              <Heart className={`w-8 h-10 ${likes.includes(currentUser._id) && 'text-red-500 fill-red-500'}`} />
              <span className='text-xl'>{likes.length} Love</span>
            </div>

          </div>

          <div onClick={() => setComment(true)} className='cursor-pointer flex items-center gap-1'>
            <MessageCircle className='w-8 h-10' />
            <span className='text-xl'>{comments.length} Comment</span>
          </div>

          <div className='cursor-pointer flex items-center gap-1'>
            <Share2 className='w-8 h-10' />
            <span className='text-xl'>{7} Share</span>
          </div>

        </div>

        <div className="flex flex-col gap-5 mt-2">
        {comments && comments.map((c) => (
          <div key={c._id} className='flex flex-col items-start gap-1'>
            
            <div className='flex gap-2 items-start'>
              <img src={c.user.profile_picture} onClick={() => navigate('/profile/' + user._id)} className='cursor-pointer w-10 h-10 rounded-full shadow' alt="" />
              <div className='flex flex-col space-x-1'>
                <span className="font-semibold">{c.user.full_name}</span>
                <p className="">{c.content}</p>
              </div>
              <span className='text-gray-500 text-sm'>{moment(c.createdAt).fromNow()}</span>
            </div>
          </div>

        ))}
      </div>
        <div className='px-4'>
          <form onSubmit={handleAddComment} className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full border border-gray-200 
                          shadow rounded-full mb-5'>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className='flex-1 outline-none text-slate-700 '
            />

            <button type="submit" className='bg-gradient-to-br from-indigo-500 to-purple-600 
                            hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full'>
              <SendHorizonal size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Comment
