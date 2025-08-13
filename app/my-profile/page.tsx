"use client";
import MyProfile from "@/components/authentication-components/my-profile";
import React, { Suspense } from "react";

const MyProfilePage: React.FC = () => {
    return (
        <Suspense>
            <MyProfile />
        </Suspense>
    )
}

export default MyProfilePage;