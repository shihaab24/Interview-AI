import React from 'react';
import { useAuth } from "../../auth/hooks/useAuth.js";
import Landing from "./Landing.jsx";
import Home from "./Home.jsx";

function HomeRouteSelector() {
    const { loading, user } = useAuth();

    if (loading) {
        return (
            <main className="loading-screen">
                <h1>Loading your profile...</h1>
            </main>
        );
    }

    if (!user) {
        return <Landing />;
    }

    return <Home />;
}

export default HomeRouteSelector;
