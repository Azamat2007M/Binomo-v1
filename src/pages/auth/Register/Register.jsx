import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../../../components/main/Nav/Nav';
import Footer from '../../../components/main/Footer/Footer';
import { TiPlus } from "react-icons/ti";
import './register.scss'

const Register = () => {
  const API = 'https://binomo-backend-v1.onrender.com';
  const [pass, setPass] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [status, setStatus] = useState({
    status: 200,
    title:""
  })
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      if (img.width <= img.height + 200 || img.height == img.width) {
        setStatus({
          status: 200,
          title:""
        })
        setImagePreview(URL.createObjectURL(file));
        setImageFile(file); 
      } else {
        setStatus({
          status: 403,
          title: "Only square images are allowed!"
        })
        e.target.value = null; 
        setImagePreview(null);
        setImageFile(null); 
      }
    };
  };

  const regEnter = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setStatus({ status: 400, title: "Please upload an image!" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("email", email);
      formData.append("name", name);   
      formData.append("password", password); 
      formData.append("wallet", 10000);
      formData.append("accepted", true);
      formData.append("typewallet", "dollar");
      formData.append("useractived", true);
      formData.append("realwallet", false);
      formData.append("followers", 0);
      formData.append("enterConditional", true);
      formData.append("bonusClaimed", false);
      formData.append("role", "user");
      formData.append("level", 1);

      await axios.post(`${API}/users/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setStatus({ status: 200, title: "" });
      navigate('/login');

    } catch (error) {
      const errorMsg = typeof error.response?.data === 'string' 
        ? error.response.data 
        : "Registration failed. Try again.";

      setStatus({
        status: 400,
        title: errorMsg
      });
      console.log(error);
    }
  };

  return (
    <>
      <Nav />
      <div className="register-wrapper">
        <div className="rw-card">
        <form onSubmit={regEnter}>
          <h1>Sign up</h1>
          {imagePreview ? (
            <div className="image-preview">
              <img src={imagePreview} alt="avatar preview" />
            </div>
          ) : (
            <div className={status.status == 200 ? "image-upload" : "image-upload e-upload"}>
              <TiPlus />
            </div>
          )}
          <div className="custom-file-input">
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept="image/*"
              required
            />
            <label htmlFor="file">Выберите файл</label>
          </div>
          <input 
            type="email" 
            value={email}
            className={status.status == 200 ? "status-s" : "status-e"} 
            placeholder="Email" 
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus({status: 200, title: ""});
            }} 
            required 
          />          
          <input 
            type="text" 
            value={name}
            className={status.status == 200 ? "status-s" : "status-e"} 
            placeholder="Name" 
            onChange={(e) => {
              setName(e.target.value);
              setStatus({status: 200, title: ""});
            }} 
            required 
          />
          <div className="pass">
            <input
              type={pass ? 'text' : 'password'}
              value={password}
              placeholder="Password"
              className={status.status == 200 ? "status-s" : "status-e"}
              onChange={(e) => {
                setPassword(e.target.value);
                setStatus({status: 200, title: ""});
              }}
              required
            />
            {pass ? (
              <div className='btnpass' onClick={() => setPass(!pass)} ><img className='d-img' src="https://www.svgrepo.com/show/380007/eye-password-hide.svg" alt="" /></div>
            ) : (
              <div className='btnpass' onClick={() => setPass(!pass)} ><img className='a-img' src="https://static.thenounproject.com/png/4334035-200.png" alt="" /></div>
            )}
          </div>
          <div className={status.status == 200 ? "login-d" : "login-e"}>
            <b>{status.status == 200 ? null : status?.title}</b>
          </div>
          <button type="submit" className="btnlogin">
            Submit
          </button>
          <div className="a-down-reg">
            <b>Have account?</b>
            <Link to={'/login'}>Login</Link>
        </div>
        </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
