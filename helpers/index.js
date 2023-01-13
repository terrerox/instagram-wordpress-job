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
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "ãàáäâáº½èéëêìíïîõòóöôùúüûñç·/_,:;";
    var to   = "aaaaaeeeeeiiiiooooouuuuncn-----";
    for (var i=0, l=from.length ; i<l ; i++) {
         str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

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

export const getInstagramPosts = async() => {
  const postsRequest = await fetch(`https://graph.facebook.com/v14.0/17841413817530260?fields=media%7Bcaption%2Cmedia_type%2Cmedia_url%2Ctimestamp%2C%20thumbnail_url%7D&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`)
  const postsJson = await postsRequest.json()
  const posts = postsJson.media.data.map(post => {
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
        instagram_media_url: media_url,
        instagram_thumbnail_url: thumbnail_url,
        media_type,
        ...data,
        datetime: convertTimestampToDate(timestamp)
      }
  })

  return posts
}
  