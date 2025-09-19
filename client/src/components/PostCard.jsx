import { BadgeCheck, Heart, MessageCircle, Share2 } from 'lucide-react'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { dummyUserData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Comment from './Comment'

const PostCard = ({ post }) => {

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [posts, setPosts] = useState([])
  const [comment, setComment] = useState(false)
  const navigate = useNavigate()
  const postWithHashtags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>')
  const [likes, setLikes] = useState(post.likes_count)
  const currentUser = useSelector((state) => state.user.value)
  const { getToken } = useAuth()


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
        const { data } = await api.post(
          `/api/post/getComment`, { postId: post._id },
          { headers: { Authorization: `Bearer ${await getToken()}` } }
        );
        if (data.success) setComments(data.comments);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComments();
  }, [getToken]);

  return (
    <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>
      {/* User Info */}
      <div onClick={() => navigate('/profile/' + post.user._id)} className='inline-flex items-center gap-3 cursor-pointer'>
        <img src={post.user.profile_picture} className='w-10 h-10 rounded-full shadow' alt="" />
        <div className=''>
          <div className='flex items-center space-x-1'>
            <span>{post.user.full_name}</span>
            <BadgeCheck className='w-4 h-4 text-blue-500' />
          </div>
          <div className='text-gray-500 text-sm'>
            @{post.user.username} • {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>
      {/* Content */}
      {post.content && <div className='text-gray-800 text-sm whitespace-pre-line'
        dangerouslySetInnerHTML={{ __html: postWithHashtags }} />}
      {/* Image */}
      <div className='grid grid-cols-2 gap-2'>
        {post.image_urls.map((img, index) => (
          <img src={img} key={index} className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && 'col-span-2 h-auto'}`} alt="" />
        ))}
      </div>
      {/* Image */}
      <div className='flex justify-between items-center text-gray-600 text-sm pt-2 border-t border-gray-300'>

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


          <div onClick={handleLike} className='cursor-pointer flex items-center gap-2'>
            <Heart className={`w-8 h-10 ${likes.includes(currentUser._id) && 'text-red-500 fill-red-500'}`} />
            <span className='text-xl'>{likes.length} Love</span>
          </div>

        </div>
        <div onClick={() => setComment(true)} className='cursor-pointer flex items-center gap-1'>
          <MessageCircle className='w-8 h-10' />
          <span className='text-xl'>{comments.length} Comment</span>
        </div>
        {
          comment ? <Comment post={post} comments={comments} setComments={setComments} likes={likes} posts={posts} setPosts={setPosts} setLikes={setLikes} comment={comment} setComment={setComment} /> : null
        }
        <div className='cursor-pointer flex items-center gap-1'>
          <Share2 className='w-8 h-10' />
          <span className='text-xl'>{7} Share</span>
        </div>

      </div>
      <div className="flex flex-col gap-5 mt-2">
        {comments && comments.slice(0, 2).map((c) => (
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
    </div>
  )
}

export default PostCard
