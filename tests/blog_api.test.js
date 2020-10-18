const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')


describe('when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    
  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username is not unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails when username is too short', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
        username: 'u',
        name: 'NewUser',
        password: 'salainen',
    }
    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('shorter')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

  })

  test('creation fails when password is too short', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
        username: 'UusiUser',
        name: 'NewUser2',
        password: 'sa',
    }
    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('too short')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

  })
})


describe('basic blog api tests', () => {
    beforeEach(async () => {
        await User.deleteMany({})
  
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
    
        await user.save()

        await Blog.deleteMany({})
    
        let blogObject = new Blog(helper.initialBlogs[0])
        blogObject.user = user.id
        await blogObject.save()
    
        blogObject = new Blog(helper.initialBlogs[1])
        blogObject.user = user.id
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

        login = {
            username: "root",
            password: "sekret"
        }
        const auth = await api
            .post('/api/login')
            .send(login)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const newBlog = {
            title: 'This is a title of valid blog',
            author: 'Valid Author',
            url: 'www.valid-url.com',
            likes: 7
        }

        const auth_str = `bearer ${auth.body.token}`
        await api
            .post('/api/blogs')
            .set('Authorization', auth_str)
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

        login = {
            username: "root",
            password: "sekret"
        }
        const auth = await api
            .post('/api/login')
            .send(login)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const auth_str = `bearer ${auth.body.token}`
        const resultBlog = await api
            .post('/api/blogs')
            .set('Authorization', auth_str)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        expect(resultBlog.body.likes).toEqual(0)
    })

    test('blog without title and url is not added', async () => {
        login = {
            username: "root",
            password: "sekret"
        }
        const auth = await api
            .post('/api/login')
            .send(login)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            
        const auth_str = `bearer ${auth.body.token}`

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
        .set('Authorization', auth_str)
        .send(newBlog)
        .expect(400)
        
        await api
        .post('/api/blogs')
        .set('Authorization', auth_str)
        .send(newBlog2)
        .expect(400)
    
        const blogsAtEnd = await helper.blogsInDb()
    
        expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
    })

    test('blog can be deleted', async () => {
        login = {
            username: "root",
            password: "sekret"
        }
        const auth = await api
            .post('/api/login')
            .send(login)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            
        const auth_str = `bearer ${auth.body.token}`

        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', auth_str)
            .expect(204)
        
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd.length).toBe(
            helper.initialBlogs.length - 1
        )
        const titles = blogsAtEnd.map(b => b.title)
        expect(titles).not.toContain(blogToDelete.title)
    })

    test('blog can be updated', async () => {
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
})

afterAll(() => {
    mongoose.connection.close()
})

