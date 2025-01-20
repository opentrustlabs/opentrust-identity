"use client";
import React from "react";
import { useParams } from 'next/navigation';
import AuthorizationGroupDetail from "@/components/authorization-groups/authorization-group-detail";



const AuthorizationGroupDetailPage: React.FC = () => {

    const params = useParams();
    const authorizationGroupId = params?.id as string;

    return (
        <AuthorizationGroupDetail authorizationGroupId={authorizationGroupId} />
    )

}

export default AuthorizationGroupDetailPage