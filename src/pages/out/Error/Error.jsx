import Footer from '../../../components/main/Footer/Footer'
import Nav from '../../../components/main/Nav/Nav'
import './error.scss'
import { Link } from 'react-router-dom'

const Error = () => {
  return (
    <>
        <Nav/>
        <div className="e-wrapper">
            <div className="e-card">
                <h1>Oops!</h1>
                <b>404 - PAGE NOT FOUND</b>
                <p>The page you are looking for might have been removed <br /> had its name changed or is temporarily unavailable</p>
                <button><Link to={'/'}>GO TO HOME PAGE</Link></button>
            </div>
        </div>
        <Footer/>
    </>
  )
}

export default Error