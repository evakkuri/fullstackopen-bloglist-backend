const lodash = require('lodash')
const logger = require('./logger')
const blog = require('../models/blog')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogList) => {
  return blogList.length === 0
    ? 0
    : blogList
      .map(blog => blog.likes)
      .reduce((sum, item) => sum + item)
}

const favoriteBlog = (blogList) => {
  return blogList.length === 0
    ? {}
    : blogList
      .reduce((currFavorite, otherBlog) => {
        if (currFavorite.likes > otherBlog.likes)
          return currFavorite
        else return otherBlog
      })
}

// 4.6
const mostBlogs = (blogList) => {
  if (blogList.length === 0) return {}

  const countedByAuthor = lodash
    .countBy(blogList, (blog) => blog.author)

  const mostBlogsAuthor = lodash.reduce(
    countedByAuthor,
    (result, newBlogs, newAuthor) => {
      if (result.blogs < newBlogs) {
        return {
          author: newAuthor,
          blogs: newBlogs
        }
      }
      else return result
    },
    {
      author: '',
      blogs: -1
    }
  )

  return mostBlogsAuthor
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}