  import { Routes, Route } from 'react-router-dom'
  import Home from './pages/Home/Home'
  import IntroDemo from './pages/IntroductionDemo/IntroDemo'
  import Login from './pages/Login/Login'
  import Register from './pages/Register/Register'
  import Profile from './pages/Profile/Profile'
  import Reyting from './pages/Binomers/Binomers'
  import CryptoDataFetcher from './pages/CryptoDataFetcher/CryptoDataFetcher'
  import Product from './pages/Product/Product'
  import Error from './pages/Error/Error'
  import Baned from './pages/Baned/Baned'
  import User from './pages/User/User'
  import Transaction from './pages/Transaction/Transaction'
  import Update from './pages/Update/Update'
  import Admin from './pages/Admin/Admin'
  import AdminUsers from './pages/AdminUsers/AdminUsers'
  import AdminAdmins from './pages/AdminAdmins/AdminAdmins'
  import Followers from './pages/Followers/Followers'
  import AdminTransaction from './pages/AdminTransaction/AdminTransaction'
  import AdminEdit from './pages/AdminEdit/AdminEdit'
  import { jwtDecode } from 'jwt-decode'
  import { useGetByIdQuery } from './redux/features/users'
  import TawkTo from './Tawk'
  import { useEffect, useState } from 'react'

  const App = () => {   
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("Access"));
    const decoded = localStorage.getItem("Access")
      ? jwtDecode(localStorage.getItem("Access"))
      : {};
    const {data: user, isLoading, error} = useGetByIdQuery(decoded?.userId, {
        skip: !decoded?.userId
      });
    

    useEffect(() => {
      const checkAuth = () => {
        setIsAuthenticated(!!localStorage.getItem("Access"));
      };

      window.addEventListener("auth_change", checkAuth);
      return () => window.removeEventListener("auth_change", checkAuth);
    }, []);

    if (isLoading) return <div className='main-loading'><img src="/Loading.svg" alt="" /></div>
    if (error) return <Error/> 

    return (
      <>
        <TawkTo />
        <Routes>
          <Route path='/' element={isAuthenticated ? <CryptoDataFetcher /> : <Home />} />          
          <Route path='/login' element={isAuthenticated ? <Error /> : <Login />} />
          <Route path='/register' element={isAuthenticated ? <Error /> : <Register />} />
          <Route path='/followers' element={isAuthenticated ? <Followers /> : <Error />} />
          <Route path='/introductiondemo' element={<IntroDemo />} />
          <Route path='/profile' element={isAuthenticated ? <Profile /> : <Error />} />
          <Route path='/binomers' element={isAuthenticated ? <Reyting /> : <Error />} />
          <Route path='/ban' element={user?.useractived === false ? <Baned /> : <Baned />} />
          <Route path='/transaction' element={isAuthenticated ? <Transaction /> : <Error />} />
          <Route path="/coin/:symbol" element={isAuthenticated ? <Product /> : <Error />} />
          <Route path="/user/:id" element={isAuthenticated ? <User /> : <Error />} />
          <Route path="/update/:id" element={isAuthenticated ? <Update /> : <Error />} />
          <Route path='/admin' element={user?.role === "admin" && user?.useractived === true ? <Admin /> : <Error />} />
          <Route path='/admin-users' element={user?.role === "admin" && user?.useractived === true ? <AdminUsers /> : <Error />} />
          <Route path='/admin-admins' element={user?.role === "admin" && user?.useractived === true ? <AdminAdmins /> : <Error />} />
          <Route path='/admin-transaction' element={user?.role === "admin" && user?.useractived === true ? <AdminTransaction /> : <Error />} />
          <Route path='/admin-edit/:id' element={user?.role === "admin" && user?.useractived === true ? <AdminEdit /> : <Error />} />
          <Route path='*' element={<Error />} />
        </Routes>
      </>
    )
  }

  export default App