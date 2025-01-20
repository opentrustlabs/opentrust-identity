"use client";
import React from "react";
import { useParams } from 'next/navigation';
import ClientDetail from "@/components/clients/client-detail";


const ClientDetailPage: React.FC = () => {

    const params = useParams();
    const clientId = params?.id as string;

    return (
        <ClientDetail clientId={clientId} />
    )

}

export default ClientDetailPage;