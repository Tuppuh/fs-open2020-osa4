const blogsRouter = require('express').Router()
const { response } = require('express')
const { request } = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', {username: 1, name: 1})
  response.json(blogs.map(blog => blog.toJSON()))
});

/*
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}
*/

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({error: 'token misisng or invalid'})
  }
  const user = await User.findById(decodedToken.id)
  /*
  let user
  if (body.userId === undefined){
    const users = await User.find({})
    user = users[0]
  }
  else{
    user = await User.findById(body.userId)
  }
  */
  const blog = new Blog({
    ...body,
    user: user._id
  })
  const savedBlog = await blog.save()
  Blog.populate(savedBlog, { path: 'user', select: 'username name' })
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog.toJSON())
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({error: 'token missing or invalid'})
  }
  const user = await User.findById(decodedToken.id)
  const blogToRemove = await Blog.findById(request.params.id)
  console.log("Blog user: ", blogToRemove.user.toString())
  console.log("Current user: ", blogToRemove.user.toString())
  if (!(blogToRemove.user.toString() === user.id.toString())){
    return response.status(401).json({error: 'only creator of the blog is allowed to remove it'})
  }
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogsRouter.post('/:id/comment', async (request, response) => {
  const comment = request.body.comment
  console.log('comment: ', comment)
  const blogToComment = await Blog.findById(request.params.id)
  console.log('blog to comment', blogToComment)
  const blogWithComments = {
    comments: [...blogToComment.comments, comment]
  }
  console.log('blog with comment', blogWithComments)
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blogWithComments, { new: true }).populate('user', {username: 1, name: 1})
  console.log('added comment: ', comment)
  response.json(updatedBlog.toJSON())
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = {
    ...body
  }
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true }).populate('user', {username: 1, name: 1})
  console.log('updated blog: ', updatedBlog)
  response.json(updatedBlog.toJSON())
})

module.exports = blogsRouter
