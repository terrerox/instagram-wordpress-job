import { getInstagramPosts, getCategory, client, uploadMedia } from './helpers/index.js'

const instagramDatocmsJob = async() => {  
  const posts = getInstagramPosts()
  const records = client.items.list();
  
  const [instagramPosts, datoCmsRecords] = await Promise.all([posts, records])
  
  const sendToDatoCms = []
  
  for (const instagramPost of instagramPosts) {
    const category = getCategory(instagramPost.description)
    const { media_url, thumbnail_url, ...restOfPosts } = instagramPost

    if(!category || !instagramPost.title) continue

    const isPostInDatoCms = datoCmsRecords.find(record => record.instagram_id === instagramPost.instagram_id)
  
    if(isPostInDatoCms) continue
  
    const media = media_url ? await uploadMedia(media_url) : null
    const thumbnail = thumbnail_url ? await uploadMedia(thumbnail_url) : null
    
    sendToDatoCms.push({
      ...restOfPosts,
      media_url: media?.url,
      thumbnail_url: thumbnail?.url,
      category: category.substring(1)
    })
  }

  if (sendToDatoCms.length === 0) return

  for (const post of sendToDatoCms) {
    await client.items.create({
      item_type: { type: 'item_type', id: '1161411' },
      ...post
    })
  }
}

await instagramDatocmsJob()
// will execute the code per hour
setInterval(async() => {
  await instagramDatocmsJob()
}, 3600000);
  