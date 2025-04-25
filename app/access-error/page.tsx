"use client";
import AccessError from "./access-error";
import { Suspense } from "react";


const Page: React.FC = () => {    

    return (
        <Suspense>
        <AccessError />        
        </Suspense>        
    )
}


export default Page;