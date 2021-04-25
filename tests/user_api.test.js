const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    await Promise.all(helper.initialUsers.map(async (user) => {
      await api
        .post('/api/users')
        .send(user)
    }))
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'elias.vakkuri',
      name: 'Elias Vakkuri',
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

    const testUser = helper.initialUsers[0]
    const newUser = {
      username: testUser.username,
      name: testUser.name,
      password: 'newPassword',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails if password is less than 3 chars long', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'elias.vakkuri',
      name: 'Elias Vakkuri',
      password: 'sa',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain(
      'password needs to be at minimum 3 characters long'
    )

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('GET operation returns the initial user', async () => {
    const result = await api
      .get('/api/users')
      .expect(200)

    expect(result.body).toHaveLength(helper.initialUsers.length)
  })

  test('successful user login returns expected fields', async () => {
    const testLogin = {
      username: helper.initialUsers[0].username,
      password: helper.initialUsers[0].password
    }

    const loginResult = await api
      .post('/api/login')
      .send(testLogin)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(loginResult.body.token).toBeDefined()
    expect(loginResult.body.username).toBeDefined()
  })

  test('username not found returns 401 error', async () => {
    const testLogin = {
      username: 'doesnotexist',
      password: helper.initialUsers[0].password
    }

    await api
      .post('/api/login')
      .send(testLogin)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('incorrect password returns 401 error', async () => {
    const testLogin = {
      username: helper.initialUsers[0].username,
      password: 'incorrectpassword'
    }

    await api
      .post('/api/login')
      .send(testLogin)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  afterAll(() => {
    mongoose.connection.close()
  })

})