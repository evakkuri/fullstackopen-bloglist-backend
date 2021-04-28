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

// 4.7
const mostLikes = (blogList) => {
  const grouped = lodash.groupBy(blogList, 'author')

  const summedLikes = Object.keys(grouped)
    .map((authorKey) => {
      return { author: authorKey, likes: lodash.sumBy(grouped[authorKey], 'likes') }
    })

  const mostLikedAuthor = lodash.maxBy(summedLikes, 'likes')

  return mostLikedAuthor
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}