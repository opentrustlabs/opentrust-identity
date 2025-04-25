"use client";

import Register from "@/components/authentication-components/register";
import { Suspense } from "react";


const Page: React.FC = () => {

    
    return (
        <Suspense>
        <Register />
        </Suspense>
    )
    
}

export default Page;