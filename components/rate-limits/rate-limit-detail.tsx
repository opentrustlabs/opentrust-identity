"use client";
import { RateLimitServiceGroup } from "@/graphql/generated/graphql-types";
import React from "react";

export interface RateLimitDetailProps {
    rateLimitDetail: RateLimitServiceGroup
}

const RateLimitDetail: React.FC<RateLimitDetailProps> = ({
    rateLimitDetail
}) => {


    return (
        <div>{JSON.stringify(rateLimitDetail)}</div>
    )
}

export default RateLimitDetail;