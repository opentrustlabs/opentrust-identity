"use client";

import ForgotPassword from "@/components/authentication-components/forgot-password";
import { Suspense } from "react";

const Page: React.FC = () => {

    
        return (
            <Suspense>
                <ForgotPassword />           
            </Suspense>

        )
    
}


export default Page;