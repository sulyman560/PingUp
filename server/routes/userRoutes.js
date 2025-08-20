import express from 'express'
import { protect } from '../middlerwares/auth.js'
import { acceptConnectionRequest, discoverUsers, followUser, getUserConnections, getUserData, getUserProfiles, sendConnectionRequest, UnfollowUser, updateUserData } from '../controllers/userController.js'
import { upload } from '../configs/multer.js'
import { getUserRecentMessages } from '../controllers/messageController.js'

const userRouter = express.Router()

userRouter.get('/data', protect, getUserData)
userRouter.post('/update',upload.fields([{name: 'profile' , maxCount: 1}, {name: 'cover' , maxCount: 1}]), protect, updateUserData)
userRouter.post('/discover', protect, discoverUsers)
userRouter.post('/follow', protect, followUser)
userRouter.post('/unfollow', protect, UnfollowUser)
userRouter.post('/connect', protect, sendConnectionRequest)
userRouter.post('/accept', protect, acceptConnectionRequest)
userRouter.get('/connections', protect, getUserConnections)
userRouter.post('/profiles', getUserProfiles)
userRouter.get('/recent-messages', protect, getUserRecentMessages)


export default userRouter