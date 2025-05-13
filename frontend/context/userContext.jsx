import { createContext, useEffect, useState } from "react";
import Cookies from 'js-cookie';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ErrorToast , SuccessToast} from "../components/toast";

export const userContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState({});
    const [isLogin, setIsLogin] = useState(null);
    const [isOtpGenerating, setOptGenerating] = useState(false);
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const navigate = useNavigate();


    useEffect(() => {
        const fetchUser = async () => {
            const token = Cookies.get('token');
            if (token) {
                try {
                    const res = await fetch(`${baseUrl}/users/profile`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const data = await res.json();
                    if (res.ok) {
                        setUser(data.user);
                        setIsLogin(true);
                        console.log("User fetched after refresh ✅", data.user);
                    } else {
                        console.log("Failed to fetch user profile", data.message);
                        setIsLogin(false);
                    }

                } catch (error) {
                    console.error("Error fetching user profile:", error.message);
                    setIsLogin(false);
                }
            } else {
                console.log("No token found, user not logged in");
                setIsLogin(false);
            }
        };

        fetchUser();
    }, [baseUrl]);

    // const register = async (name, email, password, img) => {
    //     const formData = new FormData();
    //     formData.append('name', name);
    //     formData.append('email', email);
    //     formData.append('password', password);
    //     formData.append('profilePic', img);

    //     const response = await fetch(`${baseUrl}/users/register`, {
    //         method: "POST",
    //         body: formData,
    //     });

    //     if (response.ok) {
    //         const data = await response.json();
    //         console.log(data);
    //         setUser(data);
    //     } else {
    //         const error = new Error('Registration failed');
    //         error.response = response;
    //         throw error;
    //     }
    // }

    // Step 1: Request OTP for registration
    const requestOTP = async (name, email, password, img) => {
        setOptGenerating(true)
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("profilePic", img); // Must match multer field
      
        try {
          const response = await fetch(`${baseUrl}/users/request-otp`, {
            method: "POST",
            body: formData,
          });
      
          const data = await response.json();
      
          if (!response.ok || !data.success) {
            const errorMessage = data.message || "Failed to send OTP";
            toast.custom((t) => (
              <ErrorToast t={t} title="OTP Request Failed" message={errorMessage} />
            ), { duration: 400 });
            throw new Error(errorMessage);
            setOptGenerating(false)
          }
      
          toast.custom((t) => (
            <SuccessToast t={t} title="OTP Sent" message="Check your email for the verification code." />
          ), { duration: 400 });
      
          return { success: true };
        } catch (error) {
          console.error("OTP request error:", error);
          if (!error.message.includes("OTP Request Failed")) {
            toast.custom((t) => (
              <ErrorToast t={t} title="OTP Request Error" message="Network or server error" />
            ), { duration: 400 });
            setOptGenerating(false);
          }
          return { success: false };
        }
      };
      
    
// Step 2: Verify OTP and complete registration
const verifyOTPAndRegister = async (email, otp) => {
    try {
      const response = await fetch(`${baseUrl}/users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.success) {
        toast.custom((t) => (
          <SuccessToast t={t} title="Registration Successful" message="You can now log in!" />
        ), { duration: 400 });
  
        setUser(data.user);
        return { success: true };
      } else {
        toast.custom((t) => (
          <ErrorToast t={t} title="Verification Failed" message={data.message || "Invalid OTP or registration error."} />
        ), { duration: 400 });
  
        return { success: false };
      }
    } catch (error) {
      toast.custom((t) => (
        <ErrorToast t={t} title="Verification Failed" message="Network or server error. Please try again." />
      ), { duration: 400 });
  
      return { success: false };
    }
  };
  



    const login = async (email, password) => {
        try {
            console.log("email, password", email, password);
    
            const res = await fetch(`${baseUrl}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await res.json();
    
            if (res.ok) {
                console.log("Login success:", data);
                setUser(data.user);
                setIsLogin(true); // Only set isLogin to true on successful login
                Cookies.set('token', data.token, { expires: 7 }); // token valid for 7 days
                console.log("Token saved to cookies ✅");
    
                return true; // Indicating successful login
            } else {
                console.log("Login failed:", data.message || "Unknown error");
                return false; // Indicating failed login
            }
        } catch (error) {
            console.log("Failed to login", error.message);
            return false; // Indicating failed login due to error
        }
    };
    


    const logout = () => {
        try {
            Cookies.remove('token'); // Remove the token from cookies
            setUser({});             // Clear user data
            setIsLogin(false);        // Mark user as logged out

            console.log("User logged out successfully");
            // Optionally, you can redirect user to login page if you are using react-router
            // navigate('/login');
        } catch (error) {
            console.error("Failed to logout", error.message);
        }
    };

    const updateUser = async (updatedData) => {
        const token = Cookies.get('token');
        if (token) {
            try {
                const res = await fetch(`${baseUrl}/users/profile/update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedData),
                });

                const data = await res.json();
                if (res.ok) {
                    setUser(data.user); // Update user state with new profile data
                    console.log("Profile updated successfully ✅", data.user);
                } else {
                    console.log("Failed to update profile:", data.message || "Unknown error");
                }
            } catch (error) {
                console.log("Error updating profile", error.message);
            }
        }
    };

    const uploadToCloudinary = async (file) => {
      const url = `https://api.cloudinary.com/v1_1/dw8zsmfy3/image/upload`; // ✅ Match handleImageUpload cloud name
      const formData = new FormData();
    
      formData.append("file", file);
      formData.append("upload_preset", "parking"); // ✅ Match preset used in handleImageUpload
      formData.append("effect", "background_removal"); // ✅ Same effect as in handleImageUpload
    
      try {
        const res = await fetch(url, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
    
        if (data.secure_url) {
          return data.secure_url;
        } else {
          console.error("Cloudinary response error:", data);
          return null;
        }
      } catch (err) {
        console.error("Upload failed:", err);
        return null;
      }
    };
    
    

    const applyPublisherRole = async (formData) => {
      const token = Cookies.get('token');
      if (!token) {
        toast.error("Login to apply for the role");
        return navigate('/login');
      }
    
      try {
        // ⬆️ Upload each image to Cloudinary and log their URLs
        const cnicFrontUrl = await uploadToCloudinary(formData.cnicFront);
        const cnicBackUrl = await uploadToCloudinary(formData.cnicBack);
        const facePhotoUrl = await uploadToCloudinary(formData.facePhoto);
    
        console.log("CNIC Front:", cnicFrontUrl);
        console.log("CNIC Back:", cnicBackUrl);
        console.log("Face Photo:", facePhotoUrl);
    
        // 📤 Prepare the payload to send to backend
        const body = {
          requestedRole: formData.requestedRole,
          bio: formData.bio,
          portfolio: formData.portfolio,
          contact: formData.contact,
          cnicFront: cnicFrontUrl,
          cnicBack: cnicBackUrl,
          facePhoto: facePhotoUrl,
        };
    
        const res = await fetch(`${baseUrl}/users/apply-publisher`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
    
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          toast.success(data.message);
          console.log("Submitted to backend:", body);
        } else {
          toast.error(data.message || "Failed to apply.");
        }
      } catch (error) {
        console.error("Error applying for publisher role", error.message);
        toast.error("Something went wrong while applying.");
      }
    };
      

    const contact = async (name, email, message) => {
        const token = Cookies.get('token');
    
        if (token) {
            try {
                const res = await fetch(`${baseUrl}/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        message
                    }),
                });
    
                const data = await res.json();
                if (res.ok) {
                    console.log("Contact message sent successfully ✅", data);
                    toast.success("Your message has been sent successfully!");
                } else {
                    console.log("Failed to send contact message:", data.message || "Unknown error");
                    toast.error("Failed to send your message. Please try again.");
                }
            } catch (error) {
                console.log("Error sending contact message", error.message);
                toast.error("Error sending your message. Please try again.");
            }
        } else {
            toast.error("Please log in to send a message.");
            navigate('/login');
        }
    };
    


    return (
        <userContext.Provider value={{ user, setUser, isOtpGenerating,isLogin, requestOTP,verifyOTPAndRegister, login, logout, updateUser, applyPublisherRole , contact}}>
            {children}
        </userContext.Provider>
    );
}
