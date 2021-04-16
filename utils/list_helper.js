const lodash = require('lodash')
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
const mostLikes = (blogList) => {
  if (blogList.length === 0) return {}

  const countedByAuthor = lodash.countBy(blogList, (blog) => blog.author)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}