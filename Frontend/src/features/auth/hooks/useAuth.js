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
            setUser(data.user)
        }catch(err){

        }finally{
            setLoading(false)
        }
    }

    const handleRegister = async ({username,email,password}) => {

        setLoading(true)

        try{
            const data = await register({username,email,password});
            setUser(data.user);
        }catch(err){

        }finally{
            setLoading(false)
        }
    }

    const handleLogout = async () => {

        setLoading(true);

        try{
        const data = await logout();
        setUser(null);
        }catch(err){

        }finally{
            setLoading(false)
        }
    }


    useEffect(() => {
                const getAndSetUser = async () => {
                    setLoading(true);
                    try{
                        const data = await getMe();
                        console.log("User authenticated:", data);
                        setUser(data.user);
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                        console.log("Token cookie exists:", document.cookie);
                    } finally {
                        setLoading(false);
                    }
                }
                getAndSetUser();
            }, [])


    return {user,loading,handleLogin,handleRegister,handleLogout}
}