import fetch from 'node-fetch';
import { config } from 'dotenv';
import { buildClient, LogLevel } from '@datocms/cma-client-node';

config()
const isUpper = (char) => { 
    const titleArray = char.split(" ")
    const firstWord = titleArray[0]
    let rtn = false;
    if (firstWord === firstWord.toUpperCase()) rtn = true;
    return rtn;
}

const truncateText = (text) => {
    const MAX_LENGTH = 140;
    return text.substring(0, MAX_LENGTH) + '...';
}

const createSlug = (str) => {
    str = str.replace(/^\s+|\s+$/g, '');
    str = str.toLowerCase();

    var from = "ãàáäâáº½èéëêìíïîõòóöôùúüûñç·/_,:;";
    var to   = "aaaaaeeeeeiiiiooooouuuuncn-----";
    for (var i=0, l=from.length ; i<l ; i++) {
         str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

    return str;
}

const convertTimestampToDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-br', { hour12: true })
}

const extractDataOfCaption = (caption) => {
    if(!caption) return
    let title = '', description = '', km, preview, slug, counter = 0

    const captionArray = caption.split("\n")
    
    for(const text of captionArray) {
      if(isUpper(text) && text !== '' && counter < 1) {
    	  title += text + " "
        slug = createSlug(title)
        counter++
        continue
      }
      if(text === '') continue 
      preview = truncateText(text)
      description += text + " "
    }
    
    return {
      title,
      slug,
      description,
      preview
    }
}

export const client = buildClient({
  apiToken: process.env.DATO_CMS_KEY,
  logLevel: LogLevel.BASIC,
});

export const uploadMedia = async(url) => await client.uploads.createFromUrl({
  // remote URL to upload
  url,
  // if you want, you can specify a different base name for the uploaded file
  skipCreationIfAlreadyExists: true,
  // be notified about the progress of the operation.
}) 
export const getCategory = (description) => {
  const descriptionArr = description.split(" ")
  const categories = ['#alertard','#alertardnet', '#alertainternacional', '#alertadeportiva', '#alertacuriosa', '#alertasexual']
  return descriptionArr.find(word => categories.includes(word))
}

export const getInstagramPosts = async() => {
  let nextPageExist = true, nextPageUrl = '', counter = 0, allPosts = []
  const DEFAULT_URL = `https://graph.facebook.com/v14.0/17841413817530260?fields=media%7Bcaption%2Cmedia_type%2Cmedia_url%2Ctimestamp%2C%20thumbnail_url%7D&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`

  while (nextPageExist) {
    const postsRequest = await fetch(nextPageUrl || DEFAULT_URL)
    const postsJson = await postsRequest.json()
    const postsArray = postsJson.media ? postsJson.media.data : postsJson.data
    const posts = postsArray.map((post) => {
      const { 
        id, 
        caption, 
        thumbnail_url,  
        timestamp,
        media_type,
        media_url
      } = post
      const data = extractDataOfCaption(caption)
      return {
        instagram_id: id,
        media_url,
        thumbnail_url,
        media_type,
        ...data,
        datetime: convertTimestampToDate(timestamp)
      }
    })

    const pagingObject = postsJson.media ? postsJson.media : postsJson
    nextPageExist = pagingObject.paging.next !== null
    nextPageUrl = pagingObject.paging.next

    if (counter === 3) nextPageExist = false

    if(nextPageExist) {
      allPosts.push(...posts)
      counter++
    }
  }
  return allPosts
}
  
