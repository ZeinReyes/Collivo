import { useContext } from "react";
import { useGlobalToast } from "../contexts/toastContext";

export const useToast = () => {
  const { addToast } = useGlobalToast();
  return { addToast };
};