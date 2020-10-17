const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
  
    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()
  
    blogObject = new Blog(helper.initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    
    expect(response.body.length).toBe(helper.initialBlogs.length)
})

test('blog has field id', async () => {
    const response = await api.get('/api/blogs')
    const blogToView = response.body[0]
    
    expect(blogToView.id).toBeDefined()

})

test('a valid blog can be added', async () => {
    const newBlog = {
        title: 'This is a title of valid blog',
        author: 'Valid Author',
        url: 'www.valid-url.com',
        likes: 7
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)
    
    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain(
        newBlog.title
    )
})

test('default likes is 0', async () => {
    const newBlog = {
        title: 'This is a title of valid blog',
        author: 'Valid Author',
        url: 'www.valid-url.com',
    }

    const resultBlog = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    expect(resultBlog.body.likes).toEqual(0)
})

test('blog without title and url is not added', async () => {
    const newBlog = {
        author: 'Valid Author',
        url: 'www.valid-url.com',
    }

    const newBlog2 = {
        author: 'Valid Author',
        title: 'This is a title of valid blog',
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
    
    await api
      .post('/api/blogs')
      .send(newBlog2)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
})

test('note can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(
        helper.initialBlogs.length - 1
    )
    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).not.toContain(blogToDelete.title)
})

test('note can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    
    const newBlog = {
        url: 'updatedurl',
        likes: 9001
    }
    const updatedBlog = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(newBlog)
        .expect(200)
    
    expect(updatedBlog.body.likes).toBeGreaterThan(9000)
    const blogsAtEnd = await helper.blogsInDb()
    const urls = blogsAtEnd.map(b => b.url)
    expect(urls).toContain(newBlog.url)
})

afterAll(() => {
    mongoose.connection.close()
})

