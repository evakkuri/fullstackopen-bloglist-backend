const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeAll(async () => {
  await User.deleteMany({})

  await Promise.all(helper.initialUsers.map(async (user) => {
    await api
      .post('/api/users')
      .send(user)
  }))
})

beforeEach(async () => {
  await Blog.deleteMany({})

  const testUserLogin = {
    username: helper.initialUsers[0].username,
    password: helper.initialUsers[0].password
  }

  const userLoginResponse = await api
    .post('/api/login')
    .send(testUserLogin)
    .expect(200)

  const token = userLoginResponse.body.token

  await Promise.all(helper.initialBlogs.map(async (blog) => {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blog)
  }))
})

describe('When reading blogs', () => {

  test('all blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('API returns equal number of blogs to initialBlogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('ID fields in blog entries are named correctly', async () => {
    const blogsAtStart = await helper.blogsInDb()

    blogsAtStart.forEach((blog) => {
      expect(blog.id).toBeDefined()
      expect(blog._id).not.toBeDefined()
    })
  })

  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const modifiedResultBlog = { ... resultBlog.body, user: resultBlog.body.user.id }

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
    expect(modifiedResultBlog).toEqual(processedBlogToView)
  })
})

describe('When posting blogs', () => {
  test('a valid blog entry can be added when logged in', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'Elias Vakkuri',
      url: 'http://testurl',
      likes: 5
    }

    const testUserLogin = {
      username: helper.initialUsers[1].username,
      password: helper.initialUsers[1].password
    }

    const userLoginResponse = await api
      .post('/api/login')
      .send(testUserLogin)
      .expect(200)

    const token = userLoginResponse.body.token

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain(
      'async/await simplifies making async calls'
    )
  })

  test('if likes are not provided in post, 0 is used as value', async () => {
    const blogNoLikes = {
      title: 'A blog with no likes gets 0 as initial value',
      author: 'Test Author',
      url: 'http://testurl',
    }

    const testUserLogin = {
      username: helper.initialUsers[1].username,
      password: helper.initialUsers[1].password
    }

    const userLoginResponse = await api
      .post('/api/login')
      .send(testUserLogin)
      .expect(200)

    const token = userLoginResponse.body.token

    const result = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogNoLikes)

    expect(result.status).toEqual(200)
    expect(result.body.likes).toBeDefined()
    expect(result.body.likes).toEqual(0)
  })

  test('adding blog without authorization returns 401 error', async () => {
    const newBlog = {
      author: 'Elias Vakkuri',
      url: 'http://testurl',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('blog without title is not added', async () => {
    const newBlog = {
      author: 'Elias Vakkuri',
      url: 'http://testurl',
    }

    const testUserLogin = {
      username: helper.initialUsers[1].username,
      password: helper.initialUsers[1].password
    }

    const userLoginResponse = await api
      .post('/api/login')
      .send(testUserLogin)
      .expect(200)

    const token = userLoginResponse.body.token

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without url is not added', async () => {
    const newBlog = {
      title: 'A blog without URL is not added',
      author: 'Elias Vakkuri',
    }

    const testUserLogin = {
      username: helper.initialUsers[1].username,
      password: helper.initialUsers[1].password
    }

    const userLoginResponse = await api
      .post('/api/login')
      .send(testUserLogin)
      .expect(200)

    const token = userLoginResponse.body.token

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('When deleting blogs', () => {
  test('a blog can be deleted by the original author when logged in', async () => {
    const testUserLogin = {
      username: helper.initialUsers[0].username,
      password: helper.initialUsers[0].password
    }

    const userLoginResponse = await api
      .post('/api/login')
      .send(testUserLogin)
      .expect(200)

    const token = userLoginResponse.body.token

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const deleteResponse = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(deleteResponse.status).toEqual(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })

  test('delete when not logged in returns 401', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const errorResponse = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    expect(errorResponse.body.error)
      .toContain('Auth token missing')
  })

  test('delete by other user than original author returns 400', async () => {
    const notOriginalUser = {
      username: helper.initialUsers[1].username,
      password: helper.initialUsers[1].password
    }

    const userLoginResponse = await api
      .post('/api/login')
      .send(notOriginalUser)
      .expect(200)

    const token = userLoginResponse.body.token

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const errorResponse = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    expect(errorResponse.body.error)
      .toContain('Only the original author may delete a post')
  })
})

describe('When updating blogs', () => {
  test('a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const id = blogToUpdate.id

    const updatedTitle = 'updated'
    const updatedLikes = blogToUpdate.likes + 1
    const updatedBlog = { ...blogToUpdate, title: updatedTitle, likes: updatedLikes }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    const blogToCheck = blogsAtEnd.filter(blog => blog.id === id)[0]
    expect(blogToCheck.title).toEqual(updatedTitle)
    expect(blogToCheck.likes).toEqual(updatedLikes)
  })
})

afterAll(() => {
  mongoose.connection.close()
})