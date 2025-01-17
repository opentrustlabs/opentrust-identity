"use client";
import React from "react";
import { useParams } from 'next/navigation';


const ClientDetail: React.FC = () => {

    const params = useParams();
    const clientId = params?.id as string;

    return (
        <div>Client id is {clientId}</div>
    )

}

export default ClientDetail;