import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div>
      <h1>Hello World</h1>

      <a href='/api/auth/login'>Login</a>
    </div>  
  )
}

export default Home
