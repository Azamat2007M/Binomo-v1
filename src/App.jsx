  import { Routes, Route } from 'react-router-dom'
  import Home from './pages/main/Home/Home'
  import IntroDemo from './pages/main/IntroductionDemo/IntroDemo'
  import Login from './pages/auth/Login/Login'
  import Register from './pages/auth/Register/Register'
  import Profile from './pages/extra/Profile/Profile'
  import Followers from './pages/extra/Followers/Followers'
  import Binomers from './pages/extra/Binomers/Binomers'
  import Transaction from './pages/trades/Transaction/Transaction'
  import Product from './pages/trades/Product/Product'
  import User from './pages/extra/User/User'
  import Update from './pages/extra/Update/Update'
  import Admin from './pages/admins/Admin/Admin'
  import AdminUsers from './pages/admins/AdminUsers/AdminUsers'
  import AdminAdmins from './pages/admins/AdminAdmins/AdminAdmins'
  import AdminTransaction from './pages/admins/AdminTransaction/AdminTransaction'
  import Error from './pages/out/Error/Error'
  import AdminEdit from './pages/admins/AdminEdit/AdminEdit'
  import Baned from './pages/out/Baned/Baned'
  import CryptoDataFetcher from './pages/main/CryptoDataFetcher/CryptoDataFetcher'
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
          <Route path='/binomers' element={isAuthenticated ? <Binomers /> : <Error />} />
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