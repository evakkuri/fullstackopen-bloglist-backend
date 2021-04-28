const listHelper = require('../utils/list_helper')

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

const emptyBlogs = []

describe('dummy', () => {
  test('returns one', () => {
    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
  })
})

describe('totalLikes', () => {

  test('when list has multiple blogs equals the sum of likes', () => {
    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(36)
  })

  test('when list has one blog returns likes', () => {
    const blog = [blogs[0]]
    const result = listHelper.totalLikes(blog)
    expect(result).toBe(7)
  })

  test('when list is empty returns 0', () => {
    const result = listHelper.totalLikes(emptyBlogs)
    expect(result).toBe(0)
  })
})

describe('favoriteBlog', () => {

  test('with 3 blogs returns blog with most likes', () => {
    const result = listHelper.favoriteBlog(blogs)

    const expected_favorite = {
      _id: '5a422b3a1b54a676234d17f9',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      __v: 0
    }

    expect(result).toEqual(expected_favorite)
  })

  test('with 1 blog returns that', () => {
    const result = listHelper.favoriteBlog([blogs[0]])

    const expected_favorite = {
      _id: '5a422a851b54a676234d17f7',
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
      __v: 0
    }

    expect(result).toEqual(expected_favorite)
  })

  test('with empty list returns empty object', () => {
    const result = listHelper.favoriteBlog([])
    expect(result).toEqual({})
  })
})

describe('mostBlogs', () => {

  test('returns correctly the author with most blogs', () => {
    const result = listHelper.mostBlogs(blogs)

    const expectedResult = {
      author: 'Robert C. Martin',
      blogs: 3
    }

    expect(Object.keys(result)).toContain('author')
    expect(Object.keys(result)).toContain('blogs')
    expect(result).toEqual(expectedResult)
  })
})

describe('mostLikes', () => {

  test('returns correctly the author with the most likes', () => {
    const result = listHelper.mostLikes(blogs)

    const expectedResult = {
      author: 'Edsger W. Dijkstra',
      likes: 17
    }

    expect(Object.keys(result)).toContain('author')
    expect(Object.keys(result)).toContain('likes')
    expect(result).toEqual(expectedResult)
  })
})