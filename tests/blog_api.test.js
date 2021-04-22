const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('all blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('API returns equal nunmber of blogs to initialBlogs', async () => {
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

  const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
  expect(resultBlog.body).toEqual(processedBlogToView)
})

test('a valid blog entry can be added ', async () => {
  const newBlog = {
    title: 'async/await simplifies making async calls',
    author: 'Elias Vakkuri',
    url: 'http://testurl',
    likes: 5
  }

  await api
    .post('/api/blogs')
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
    author: 'Elias Vakkuri',
    url: 'http://testurl',
  }

  const result = await api
    .post('/api/blogs')
    .send(blogNoLikes)

  expect(result.status).toEqual(200)
  expect(result.body.likes).toBeDefined()
  expect(result.body.likes).toEqual(0)
})

test('blog without title is not added', async () => {
  const newBlog = {
    author: 'Elias Vakkuri',
    url: 'http://testurl',
  }

  await api
    .post('/api/blogs')
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

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(
    helper.initialBlogs.length - 1
  )

  const titles = blogsAtEnd.map(r => r.title)

  expect(titles).not.toContain(blogToDelete.title)
})

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

afterAll(() => {
  mongoose.connection.close()
})