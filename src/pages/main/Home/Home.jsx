import { useEffect } from 'react'
import Nav from '../../../components/main/Nav/Nav'
import Footer from '../../../components/main/Footer/Footer'
import Header from '../../../components/main/Header/Header'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { useGetByIdQuery } from '../../../redux/features/users'
import Error from '../../out/Error/Error'

const Home = () => {
  const navigate = useNavigate()

  const decoded = localStorage.getItem("Access")
    ? jwtDecode(localStorage.getItem("Access"))
    : {};
  const {data: user, isLoading, error} = useGetByIdQuery(decoded?.userId, {
    skip: !decoded?.userId
  });
  
  useEffect(() => {
    if (!user) { 
      if (user?.useractived === false) {
        navigate("/ban")
      }else if(localStorage.getItem("Access")){
        navigate('/')
      } else {
        navigate("/")
      }
    }
  }, [user])

  if (isLoading) return <div className='main-loading'><img src="/Loading.svg" alt="" /></div>
  if (error) return <Error/>  
  
  return (
    <>
        <Nav/>
        <Header/>
        <Footer/>
    </>
  )
}

export default Home