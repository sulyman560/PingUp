import fs from 'fs'
import imagekit from '../configs/imagekit.js';
import Post from '../models/Post.js';
import User from '../models/Users.js';

//Add Post
export const addPost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { content, post_type } = req.body;
        const images = req.files

        let image_urls = []

        if (images.length) {
            image_urls = await Promise.all(
                images.map(async (image) => {
                    const fileBuffer = fs.readFileSync(image.path)
                    const response = await imagekit.upload({
                        file: fileBuffer,
                        fileName: image.originalname,
                        folder: 'posts',
                    })
                    const url = imagekit.url({
                        path: response.filePath,
                        transformation: [
                            { quality: 'auto' },
                            { format: 'webp' },
                            { width: '1280' }
                        ]
                    })
                    return url
                })
            )
        }
        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type
        })
        res.json({ success: true, message: 'Post created successfully' })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Get Posts
export const getFeedPosts = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId)

        // User connections and followings
        const userIds = [userId, ...user.connections, ...user.following]
        const posts = await Post.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 });

        res.json({ success: true, posts })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Like Post
export const likePost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { postId } = req.body;

        const post = await Post.findById(postId);
        if (post.likes_count.includes(userId)) {
            post.likes_count = post.likes_count.filter(user => user !== userId)
            await post.save()
            return res.json({ success: true, message: 'Post unliked' })
        } else {
            post.likes_count.push(userId)
            await post.save()
            return res.json({ success: true, message: 'Post liked' })
        }

        return res.json({ success: true, post })
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message })
    }
}

export const getPost = async (req, res) => {
    try {
        const { postId } = req.body;
        const post = await Post.findById(postId)
            .populate("likes_count", "full_name") // likes_count এ userId → username
            .lean();

        console.log(post.likes_count);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.json({ success: true, post });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const { userId } = req.auth(); // auth middleware থেকে

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = { user: userId, content };
    post.comments.push(comment);

    await post.save();

    // populate করে username সহ comment পাঠাচ্ছে
    const populatedPost = await Post.findById(postId)
      .populate("comments.user", "username")
      .lean();

    return res.json({
      success: true,
      comments: populatedPost.comments
    });

  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.body;

    const post = await Post.findById(postId)
      .populate({
        path: "comments.user",
        select: "username full_name email profile_picture bio createdAt" // যেসব field দরকার শুধু সেগুলো দাও
      })
      .lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json({ success: true, comments: post.comments });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};