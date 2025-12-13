"use client";

import Login from "@/components/authentication-components/login";
import { Suspense } from "react";

const Page: React.FC = () => {    
    return (
        <Suspense>
            <Login />
        </Suspense>
    )
}

export const dynamic = 'force-dynamic';
export default Page;