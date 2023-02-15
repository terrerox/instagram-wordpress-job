import { buildClient, LogLevel } from '@datocms/cma-client-node';
import { getInstagramPosts, getCategory } from './helpers/index.js'
import { config } from 'dotenv';
config()

const instagramDatocmsJob = async() => {
  const client = buildClient({
    apiToken: process.env.DATO_CMS_KEY,
    logLevel: LogLevel.BASIC,
  });
  
  const posts = getInstagramPosts()
  const records = client.items.list();
  
  const [instagramPosts, datoCmsRecords] = await Promise.all([posts, records])
  
  const sendToDatoCms = []
  
  for (const instagramPost of instagramPosts) {
    const category = getCategory(instagramPost.description)
    if(!category || !instagramPost.title) continue

    const isPostInDatoCms = datoCmsRecords.find(record => record.instagram_id === instagramPost.instagram_id)
  
    if(isPostInDatoCms) continue
  
    sendToDatoCms.push({
      ...instagramPost,
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

// will execute the code per hour
setInterval(async() => {
  await instagramDatocmsJob()
}, 3600000);
  