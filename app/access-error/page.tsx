"use client";
import AccessError from "./access-error";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

const Page: React.FC = () => {

    console.log("should show error message");
    return (
        <Suspense>
            <AccessError />
        </Suspense>
    )
}


export default Page;