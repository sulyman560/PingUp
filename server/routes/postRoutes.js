import express from 'express'
import { upload } from '../configs/multer.js'
import { protect } from '../middlerwares/auth.js'
import { addComment, addPost, getComments, getFeedPosts, getPost, likePost } from '../controllers/postController.js'

const postRouter = express.Router()

postRouter.post('/add', upload.array('images', 4), protect, addPost)
postRouter.get('/feed', protect, getFeedPosts)
postRouter.post('/like', protect, likePost)
postRouter.post('/getpost', protect, getPost)
postRouter.post('/Comment', protect, addComment)
postRouter.post('/getComment', protect, getComments)

export default postRouter