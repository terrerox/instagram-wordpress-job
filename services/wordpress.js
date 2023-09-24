import { request } from '../helpers/graphqlClient.js'
import { config } from 'dotenv';
config()
const wordpressService = {}

wordpressService.login = async() => {
    const postsRequest = await request({
        query: `
        mutation LoginUser($loginInput: LoginInput!) {
          login( input: $loginInput) {
              authToken
              user {
                id
                name
              }
          }
        }
        `,
        variables: {
          loginInput: {
            clientMutationId: "loginMutation",
            username: process.env.WORDPRESS_USER,
            password: process.env.WORDPRESS_PASSWORD,
          }
        },
        preview: false,
    });

    return postsRequest.login.authToken
}

wordpressService.getPostsSlug = async() => {
  const postsRequest = await request({
      query: `
      {
        posts {
          nodes {
            slug
          }
        }
      }
      `,
      variables: {},
      preview: false,
  });

  return postsRequest.posts.nodes
}

wordpressService.createPost = async(createPostInput, token) => {
    await request({
        query: `
        mutation CreatePost($createPostInput: CreatePostInput!) {
            post: createPost(input: $createPostInput) {
                clientMutationId
            }
        }
        `,
        variables: { createPostInput },
        preview: false,
        token
    });
}

export default wordpressService;
