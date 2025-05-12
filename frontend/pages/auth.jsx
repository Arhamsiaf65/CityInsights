import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { userContext } from '../context/userContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { SuccessToast, ErrorToast } from '../components/toast';

const AuthPage = ({ type }) => {
  const isLogin = type === 'login';
  const navigate = useNavigate();
  const { requestOTP, verifyOTPAndRegister, isOtpGenerating, login } = useContext(userContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: request OTP, 2: reset password
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [requesting, setRequesting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showReset) {
      if (resetStep === 1) {
        // Step 1: Send OTP
        try {
          setRequesting(true)
          const res = await fetch(`${baseUrl}/users/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          if (data.success) {
            toast.custom((t) => <SuccessToast t={t} title="OTP Sent!" message="Check your email for the OTP." />);
            setResetStep(2);
            setRequesting(false)
          } else {
            toast.custom((t) => <ErrorToast t={t} title="Failed" message={data.message} />);
            setRequesting(false)
          }
        } catch (err) {
          toast.custom((t) => <ErrorToast t={t} title="Error" message="Something went wrong." />);
          setRequesting(false)
        }
      } else {
        // Step 2: Reset Password
        if (!otp || !password || !confirmPassword) {
          toast.custom((t) => <ErrorToast t={t} title="Error" message="All fields are required." />);
          return;
        }

        if (password !== confirmPassword) {
          toast.custom((t) => <ErrorToast t={t} title="Mismatch" message="Passwords do not match." />);
          return;
        }

        try {
          setRequesting(true)
          const res = await fetch(`${baseUrl}/users/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword: password })
          });
          const data = await res.json();
          if (data.success) {
            toast.custom((t) => <SuccessToast t={t} title="Success" message="Password reset successful!" />);
            setTimeout(() => navigate('/login'), 1500);
            setRequesting(false)
          } else {
            toast.custom((t) => <ErrorToast t={t} title="Failed" message={data.message} />);
            setRequesting(false)
          }
        } catch (err) {
          toast.custom((t) => <ErrorToast t={t} title="Error" message="Something went wrong." />)
          setRequesting(false);
        }
      }

      return;
    }

    if (!isLogin) {
      if (!otpSent) {
        if (password !== confirmPassword) {
          toast.custom((t) => <ErrorToast t={t} title="Mismatch" message="Passwords do not match." />);
          return;
        }
        const otpResponse = await requestOTP(name, email, password, profilePic);
        if (otpResponse.success) {
          setOtpSent(true);
        }
      } else {
        const result = await verifyOTPAndRegister(email, otp);
        if (result.success) {
          toast.custom((t) => <SuccessToast t={t} title="Success" message="Account created!" />);
          setTimeout(() => navigate('/login'), 1500);
        }
      }
    } else {
      try {
        const isLoggedIn = await login(email, password);
        if (isLoggedIn) {
          toast.custom((t) => <SuccessToast t={t} title="Login Successful!" message="Welcome back!" />);
          setTimeout(() => navigate('/'), 1000);
        } else {
          toast.custom((t) => <ErrorToast t={t} title="Login Failed" message="Check your credentials." />);
        }
      } catch (error) {
        toast.custom((t) => <ErrorToast t={t} title="Error" message="Unexpected error occurred." />);
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
                {showReset ? 'Reset Password' : isLogin ? 'Welcome Back!' : 'Create Account'}
              </span>

              {!isLogin && !showReset && (
                <>
                  <input type="text" placeholder="Name" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                  <input type="file" className="file-input" onChange={(e) => setProfilePic(e.target.files[0])} accept="image/*" />
                </>
              )}

              <input type="email" placeholder="Email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />

              {(!showReset || resetStep === 2) && (
                <input type="password" placeholder={showReset ? 'New Password' : 'Password'} className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
              )}

              {(!isLogin && !otpSent && !showReset) ||
                (showReset && resetStep === 2) ? (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              ) : null}

              {(!isLogin && otpSent) || (showReset && resetStep === 2) ? (
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              ) : null}

              <button type="submit" className="button sign-in">
                {showReset
                  ? requesting
                    ? 'Requesting...'
                    : resetStep === 1
                      ? 'Send OTP'
                      : 'Reset Password'
                  : isLogin
                    ? 'Sign In'
                    : otpSent
                      ? 'Verify OTP'
                      : isOtpGenerating
                        ? 'Generating OTP...'
                        : 'Send OTP'}

              </button>

              <p className="footer">
                {showReset ? (
                  <span className="link" onClick={() => setShowReset(false)}>Back to Login</span>
                ) : isLogin ? (
                  <>
                    <span className="link" onClick={() => navigate('/signup')}>Register Instead</span>
                    <br />
                    <span className="link" onClick={() => setShowReset(true)}>Forgot Password?</span>
                  </>
                ) : (
                  <span className="link" onClick={() => navigate('/login')}>Login Instead</span>
                )}
              </p>
            </form>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default AuthPage;

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
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0.2));
    box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.2),
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
    border-radius: 20px 20px 20px 20px;
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
  }

  .link {
    color: white;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
  }
`;
