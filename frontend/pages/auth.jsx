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
.container {
  --form-width: 380px;
  --aspect-ratio: 1.33;
  --login-box-color: #697EAD;
  --input-color: #3a3a3a;
  --button-color: #373737;
  --footer-color: rgba(255, 255, 255, 0.5);
  
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--login-box-color);
  border-radius: 24px;
  overflow: hidden;
  width: 800px; /* updated wider width */
  height: 500px;
  margin-top: 5px;
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.2),
    0 8px 16px rgba(0, 0, 0, 0.2),
    0 0 8px rgba(255, 255, 255, 0.1),
    0 0 16px rgba(255, 255, 255, 0.08);
}

.image-section {
  flex: 1;
  // background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-box {
  width: 100%;
  height: auto;
  background: transparent;
  box-shadow: none;
  padding: 0;
}


  .form {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 10px;
  }

  .logo {
    width: 65px;
    height: 65px;
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

  .user {
    position: absolute;
    height: 50px;
    color: #fff;
  }

  .header {
    width: 100%;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    padding: 6px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .input {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 12px;
    background: var(--input-color);
    color: white;
    outline: none;
    font-size: 14px;
  }

  .input:focus {
    border: 1px solid #fff;
  }

  .button {
    width: 100%;
    height: 40px;
    border: none;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: grid;
    place-content: center;
    gap: 10px;
    background: var(--button-color);
    color: white;
    transition: 0.3s;
    box-shadow:
      inset 0px 3px 6px -4px rgba(255, 255, 255, 0.6),
      inset 0px -3px 6px -2px rgba(0, 0, 0, 0.8);
  }
  .sign-in {
    margin-top: 5px;
  }

  .google-sign-in {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }

  .button:hover {
    background: rgba(255, 255, 255, 0.25);
    box-shadow:
      inset 0px 3px 6px rgba(255, 255, 255, 0.6),
      inset 0px -3px 6px rgba(0, 0, 0, 0.8),
      0px 0px 8px rgba(255, 255, 255, 0.05);
  }

  .icon {
    height: 16px;
  }

  .footer {
    width: 100%;
    text-align: left;
    color: var(--footer-color);
    font-size: 12px;
  }

  .footer .link {
    position: relative;
    color: var(--footer-color);
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .footer .link::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 0;
    border-radius: 6px;
    height: 1px;
    background: currentColor;
    transition: width 0.3s ease;
  }

  .footer .link:hover {
    color: #fff;
  }

  .footer .link:hover::after {
    width: 100%;
  }`;

export default AuthPage;
