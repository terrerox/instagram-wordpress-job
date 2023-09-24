import { getInstagramPosts, getCategory, getDigitsAfterLastHyphen } from './helpers/index.js'
import wordpressService from './services/wordpress.js';

const instagramToWordpressJob = async() => {  
  const posts = getInstagramPosts()
  const records = wordpressService.getPostsSlug();
  const [instagramPosts, wordpressPostsSlug] = await Promise.all([posts, records])
  
  const sendToWordpress = []
  
  for (const instagramPost of instagramPosts) {
    const category = getCategory(instagramPost.content)
    const { media_url, thumbnail_url, slug, instagram_id, ...rest } = instagramPost

    if(!category || !instagramPost.title) continue

    const isPostInWordpress = wordpressPostsSlug.find(record => { 
      const idFromSlug = getDigitsAfterLastHyphen(record.slug)
      console.log({ idFromSlug, id: instagramPost.instagram_id })
      return idFromSlug === instagramPost.instagram_id 
    })
    console.log(isPostInWordpress)
    if(isPostInWordpress) continue
    
    sendToWordpress.push({
      ...rest,
      //media_url: media?.url,
      slug: `${slug}-${instagram_id}`,
      status: "PUBLISH",
      //thumbnail_url: thumbnail?.url,
      //category: category.substring(1)
    })
  }
  if (sendToWordpress.length === 0) return

  const authToken = await wordpressService.login()
  for (const post of sendToWordpress) {
    console.log(post)
    await wordpressService.createPost(post, authToken)
    console.log(`Post with the slug ${post.slug} uploaded to Wordpress`)
  }
}

await instagramToWordpressJob()
// will execute the code per hour
setInterval(async() => {
  await instagramToWordpressJob()
}, 3600000);
  