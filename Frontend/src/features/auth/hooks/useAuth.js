import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context.jsx";
import { login,register,logout,getMe } from "../services/auth.api";


export const useAuth = () => {

    const context = useContext(AuthContext);
    const {user,setUser,loading,setLoading} = context;
    
    const handleLogin = async ({email,password}) => {
        setLoading(true);
        try {
            const data = await login({email,password});
            if (data && data.token) {
                localStorage.setItem("token", data.token);
            }
            if (data && data.user) {
                setUser(data.user);
            }
        }catch(err){
            console.error("Login hook failed:", err);
            throw err;
        }finally{
            setLoading(false);
        }
    }

    const handleRegister = async ({username,email,password}) => {
        setLoading(true);
        try{
            const data = await register({username,email,password});
            if (data && data.token) {
                localStorage.setItem("token", data.token);
            }
            if (data && data.user) {
                setUser(data.user);
            }
        }catch(err){
            console.error("Registration hook failed:", err);
            throw err;
        }finally{
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        setLoading(true);
        try{
            await logout();
        }catch(err){
            console.error("Logout hook failed:", err);
        }finally{
            localStorage.removeItem("token");
            setUser(null);
            setLoading(false);
        }
    }


    useEffect(() => {
        const getAndSetUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                return;
            }
            setLoading(true);
            try{
                const data = await getMe();
                if (data && data.user) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                localStorage.removeItem("token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        getAndSetUser();
    }, [])


    return {user,loading,handleLogin,handleRegister,handleLogout}
}