import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { userContext } from '../context/userContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // import icons
import { SuccessToast, ErrorToast } from '../components/toast';



const AuthPage = ({ type }) => {
  const isLogin = type === 'login';
  const { register, login } = useContext(userContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
        if (password !== confirmPassword) {
            toast.custom((t) => (
                <ErrorToast
                    t={t}
                    title="Password Mismatch"
                    message="Passwords do not match. Please try again!"
                />
            ), { duration: 400 });
            return;
        }
        try {
            await register(name, email, password, profilePic);

            toast.custom((t) => (
                <SuccessToast
                    t={t}
                    title="Registration Successful!"
                    message="You can now login and enjoy!"
                />
            ), { duration: 400 });

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            if (error.response && error.response.status == 409) {
                toast.custom((t) => (
                    <ErrorToast
                        t={t}
                        title="User Already Exists"
                        message="A user with this email already exists."
                    />
                ), { duration: 400 });
            } else {
                toast.custom((t) => (
                    <ErrorToast
                        t={t}
                        title="Registration Failed"
                        message="Something went wrong. Please try again!"
                    />
                ), { duration: 400 });
            }
        }
    } else {
        try {
            const isLoggedIn = await login(email, password);

            if (isLoggedIn) {
                toast.custom((t) => (
                    <SuccessToast
                        t={t}
                        title="Login Successful!"
                        message="Browse hassle free!"
                    />
                ), { duration: 400 });

                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } else {
                toast.custom((t) => (
                    <ErrorToast
                        t={t}
                        title="Login Failed"
                        message="Check your credentials and try again."
                    />
                ), { duration: 400 });
            }
        } catch (error) {
            toast.custom((t) => (
                <ErrorToast
                    t={t}
                    title="Login Failed"
                    message="An unexpected error occurred. Please try again."
                />
            ), { duration: 400 });
        }
    }
};




  return (
    <StyledWrapper>
      <div className="container">
        <div className="image-section">
          <img src="/login.png" alt="Login" />
        </div>
        <div className="form-section">
          <div className="login-box">
            <form className="form" onSubmit={handleSubmit}>
              <div className="logo" />
              <span className="header">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </span>

              {!isLogin && (
                <>
                  <input
                    type="text"
                    placeholder="Name"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </>
              )}
              <input
                type="email"
                placeholder="Email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {!isLogin && (
                <>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePic(e.target.files[0])}
                    className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 
             file:rounded-full file:border-0 
             file:text-sm file:font-semibold 
             file:bg-blue-600 file:text-white 
             hover:file:bg-blue-700 
             cursor-pointer"
                  />

                </>
              )}

              <button type="submit" className="button sign-in">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </button>

              {isLogin ? (
                <p className="footer">
                  Don't have an account?{" "}
                  <span className="link" onClick={() => navigate('/signup')}>
                    Register Instead
                  </span>
                </p>
              ) : (
                <p className="footer">
                  Already have an account?{" "}
                  <span className="link" onClick={() => navigate('/login')}>
                    Login Instead
                  </span>
                </p>
              )}

            </form>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};



const StyledWrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0C3883;
  padding: 20px;

  .container {
    display: flex;
    flex-direction: row;
    width: 800px;
    height: 500px;
    background: #697EAD;
    border-radius: 24px;
    overflow: hidden;
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.2),
      0 8px 16px rgba(0, 0, 0, 0.2),
      0 0 8px rgba(255, 255, 255, 0.1),
      0 0 16px rgba(255, 255, 255, 0.08);

    @media (max-width: 768px) {
      flex-direction: column;
      width: 100%;
      height: auto;
    }
  }

  .image-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;

      @media (max-width: 768px) {
        height: 200px;
      }
    }
  }

  .form-section {
    flex: 1;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
      padding: 15px;
    }
  }

  .form {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  .logo {
    width: 65px;
    height: 65px;
    align-self: center;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2),
      rgba(0, 0, 0, 0.2)
    );
    box-shadow:
      8px 8px 16px rgba(0, 0, 0, 0.2),
      -8px -8px 16px rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    border: 2px solid #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .logo::before {
    content: "";
    position: absolute;
    bottom: 10px;
    width: 50%;
    height: 20%;
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    border-bottom-right-radius: 20px;
    border-bottom-left-radius: 20px;
    border: 2.5px solid #fff;
  }

  .logo::after {
    content: "";
    position: absolute;
    top: 10px;
    width: 30%;
    height: 30%;
    border-radius: 50%;
    border: 2.5px solid #fff;
  }

  .header {
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    text-align: center;

    @media (max-width: 480px) {
      font-size: 20px;
    }
  }

  .input, .file-input {
    width: 100%;
    padding: 10px;
    border-radius: 12px;
    border: none;
    outline: none;
    background: #3a3a3a;
    color: white;
    font-size: 14px;
  }

  .file-input {
    cursor: pointer;
  }

  .button {
    width: 100%;
    height: 40px;
    border: none;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    background: #373737;
    color: white;
    box-shadow:
      inset 0px 3px 6px -4px rgba(255, 255, 255, 0.6),
      inset 0px -3px 6px -2px rgba(0, 0, 0, 0.8);
    transition: 0.3s;
  }

  .button:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .footer {
    font-size: 14px;
    text-align: center;
    color: rgba(255, 255, 255, 0.8);

    @media (max-width: 480px) {
      font-size: 13px;
    }
  }

  .link {
    color: white;
    font-weight: bold;
    cursor: pointer;
    text-decoration: underline;
  }
`;


export default AuthPage;
