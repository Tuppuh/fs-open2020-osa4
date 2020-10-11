const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, item) => {return sum + item.likes}, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((favorite, item) => {
        return (!favorite || item.likes > favorite.likes) ? item : favorite
    }, null)
}

const mostBlogs = (blogs) => {
    const blogsPerAuthor = blogs.reduce((authObj, item) => {
        const author = item.author
        if (author in authObj){
            return {
                ...authObj,
                [author]: (authObj[author] + 1)
            }
        }
        else{
            return {
                ...authObj,
                [author]: 1
            }
        }
    }, {})
    bestAuth = Object.keys(blogsPerAuthor).reduce((best, key) => {
        return (!best || blogsPerAuthor[key] > blogsPerAuthor[best]) ? key : best
    }, null)
    return bestAuth ? {[bestAuth]: blogsPerAuthor[bestAuth]} : null
}

const mostLikes = (blogs) => {
    const likesPerAuthor = blogs.reduce((authObj, item) => {
        const author = item.author
        const likes = item.likes
        if (author in authObj){
            return {
                ...authObj,
                [author]: (authObj[author] + likes)
            }
        }
        else{
            return {
                ...authObj,
                [author]: likes
            }
        }
    }, {})
    bestAuth = Object.keys(likesPerAuthor).reduce((best, key) => {
        return (!best || likesPerAuthor[key] > likesPerAuthor[best]) ? key : best
    }, null)
    return bestAuth ? {[bestAuth]: likesPerAuthor[bestAuth]} : null
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}
