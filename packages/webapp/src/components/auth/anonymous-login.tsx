import { useLogin } from "@refinedev/core";
import { useEffect } from "react";
import { Navigate } from "react-router";


export function AnonymousLogin() {
  const { mutate, isSuccess, isLoading, isError } = useLogin();

  const redirectTo = window.location.pathname;
  
  useEffect(function autoLogInOnLoad() {
    if (isSuccess || isLoading || isError) {
      return;
    }
    mutate({ redirectTo });
  }, [isError, isLoading, isSuccess, mutate, redirectTo]);
  
  if (isSuccess) {
    return <Navigate to={redirectTo} />
  }
  
  return null;
}
