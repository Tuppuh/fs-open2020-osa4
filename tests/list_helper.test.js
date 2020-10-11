const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

const blogList = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '212312sdafdafa',
    title: 'Titteli',
    author: 'Huukkel von Kuukkel',
    url: 'http://www.html',
    likes: 3,
    __v: 0
  },
  {
    _id: '212312sdafdafa2',
    title: 'Titteli2',
    author: 'Huukkel von Kuukkel JR.',
    url: 'http://www2.html',
    likes: 105,
    __v: 0
  },
  {
    _id: '212312sdafdafa2',
    title: 'Titteli3',
    author: 'Huukkel von Kuukkel',
    url: 'http://www2.html',
    likes: 103,
    __v: 0
  },
]

describe('total likes', () => {

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes([blogList[0]])
    expect(result).toBe(5)
  })

  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])
    expect(result).toBe(0)
  })

  test('of bigger list is calculated right', () => {
    const result = listHelper.totalLikes(blogList)
    expect(result).toBe(216)
  })
})

describe('most likes', () => {
  test('when list has only one blog equals that', () => {
    const result = listHelper.favoriteBlog([blogList[0]])
    expect(result).toEqual(blogList[0])
  })

  test('of empty list is falsy', () => {
    const result = listHelper.favoriteBlog([])
    expect(result).toBeFalsy()
  })

  test('of bigger list is calculated right', () => {
    const result = listHelper.favoriteBlog(blogList)
    expect(result).toEqual(blogList[2])
  })
})

describe('most blogs', () => {

  test('when using only one entry has only that author and single blog', () => {
    const result = listHelper.mostBlogs([blogList[0]])
    expect(result).toEqual({'Edsger W. Dijkstra': 1})
  })

  test('of empty list is falsy', () => {
    const result = listHelper.mostBlogs([])
    expect(result).toBeFalsy()
  })

  test('of full list is calculated properly', () => {
    const result = listHelper.mostBlogs(blogList)
    expect(result).toEqual({'Huukkel von Kuukkel': 2})
  })
})


describe('most likes', () => {

  test('when using only one entry has only that author and single set of votes', () => {
    const result = listHelper.mostLikes([blogList[0]])
    expect(result).toEqual({'Edsger W. Dijkstra': 5})
  })

  test('of empty list is falsy', () => {
    const result = listHelper.mostLikes([])
    expect(result).toBeFalsy()
  })

  test('of full list is calculated properly', () => {
    const result = listHelper.mostLikes(blogList)
    expect(result).toEqual({'Huukkel von Kuukkel': 106})
  })
})