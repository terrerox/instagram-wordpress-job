import axios from 'axios'
export async function request({ query, variables, token }) {
    const endpoint = "https://ahb.371.myftpupload.com/graphql"
    const headers = token ? {
      'Authorization': `Bearer ${token}`,
    } : null;   
    const { data } = await axios.post(
      endpoint,
      {
        query,
        variables
      },
      {
        headers
      }
    )
  
    if (data.errors) {
      throw JSON.stringify(data.errors);
    }
  
    return data.data;
}