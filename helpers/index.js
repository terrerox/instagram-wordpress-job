import fetch from 'node-fetch';
import { config } from 'dotenv';

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
    return date.toLocaleString({ hour12: true })
}

const extractDataOfCaption = (caption) => {
    if(!caption) return
    let title = '', content = '', km, excerpt, slug, counter = 0

    const captionArray = caption.split("\n")
    
    for(const text of captionArray) {
      if(isUpper(text) && text !== '' && counter < 1) {
    	  title += text + " "
        slug = createSlug(title)
        counter++
        continue
      }
      if(text === '') continue 
      excerpt = truncateText(text)
      content += text + " "
    }
    
    return {
      title,
      slug,
      content,
      excerpt
    }
}

export const getCategory = (description) => {
  const descriptionArr = description.split(" ")
  const categories = ['#alertard','#alertardnet', '#alertainternacional', '#alertadeportiva', '#alertacuriosa', '#alertasexual']
  return descriptionArr.find(word => categories.includes(word))
}

export const getDigitsAfterLastHyphen = (inputString) => {
  const match = inputString.match(/[^-]+$/);
  return match ? match[0] : null;
}

export const getInstagramPosts = async() => {
  let nextPageExist = true, nextPageUrl = '', counter = 0, allPosts = []
  const DEFAULT_URL = `https://graph.facebook.com/v14.0/17841447626729128?fields=media%7Bcaption%2Cmedia_type%2Cmedia_url%2Ctimestamp%2C%20thumbnail_url%7D&access_token=${process.env.ALERTA_RD_ACCESS_TOKEN}`
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
        media_url
      } = post
      const data = extractDataOfCaption(caption)
      return {
        instagram_id: id,
        media_url,
        thumbnail_url,
        ...data,
        date: convertTimestampToDate(timestamp)
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
  
