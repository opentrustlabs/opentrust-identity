"use client";
import React, { Suspense } from "react";
import MyProfile from "@/components/authentication-components/my-profile";

const MyProfilePage: React.FC = () => {

    return (
        <Suspense
        >
            <MyProfile />
        </Suspense>
    )
}

export default MyProfilePage;