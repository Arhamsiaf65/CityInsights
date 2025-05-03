import { createContext, useEffect, useState } from "react";
import Cookies from 'js-cookie';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const userContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState({});
    const [isLogin, setIsLogin] = useState(null);
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

    const register = async (name, email, password, img) => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('profilePic', img);

        const response = await fetch(`${baseUrl}/users/register`, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            setUser(data);
        } else {
            const error = new Error('Registration failed');
            error.response = response;
            throw error;
        }
    }

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

    const applyPublisherRole = async (requestedRole, bio, portfolio, contact) => {
        const token = Cookies.get('token');

        if (token) {
            try {
                const res = await fetch(`${baseUrl}/users/apply-publisher`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        requestedRole,
                        bio,
                        portfolio,
                        contact
                    }),
                });

                const data = await res.json();
                console.log("data", data);
                if (res.ok) {
                    if (data.user.verificationStatus.includes('pending')) {
                        // User has already applied, show a warning toast
                        toast.warn("You have already applied for the publisher role. Your application is pending verification.");
                    } else {
                        // Successfully updated application or first-time application
                        setUser(data.user); // Update the user state with new role data
                        console.log("Publisher role application submitted ✅", data.user);
                    }
                } else {
                    console.log("Failed to apply for publisher role:", data.message || "Unknown error");
                    toast.error(data.message);
                }
            } catch (error) {
                console.log("Error applying for publisher role", error.message);
                toast.error("Error applying for publisher role.");
            }
        }
        else{
            toast.error("login to apply for the role");
            navigate('/login')
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
        <userContext.Provider value={{ user, setUser, isLogin, register, login, logout, updateUser, applyPublisherRole , contact}}>
            {children}
        </userContext.Provider>
    );
}
