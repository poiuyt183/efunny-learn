"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import { useTRPC } from "@/trpc/client";

const Client = () => {
  const trpc = useTRPC();
  const { data: users } = useSuspenseQuery(trpc.getUsers.queryOptions());
  return <div>{JSON.stringify(users)}</div>;
};

export default Client;
