import React, { useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { X, Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideOut = keyframes`
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(30px); }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 9999;
`;

const ToastBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  background-color: ${({ type }) =>
    type === "info"
      ? "#dbeafe"
      : type === "warning"
      ? "#fef9c3"
      : type === "error"
      ? "#fee2e2"
      : type === "success"
      ? "#dcfce7"
      : "#f3f4f6"};
  border-left: 6px solid
    ${({ type }) =>
      type === "info"
        ? "#1e3a8a"
        : type === "warning"
        ? "#facc15"
        : type === "error"
        ? "#ef4444"
        : type === "success"
        ? "#22c55e"
        : "#9ca3af"};
  border-radius: 10px;
  padding: 1rem 1.2rem;
  width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: ${({ isLeaving }) => (isLeaving ? slideOut : slideIn)} 0.3s ease forwards;
  position: relative;
  color: #111;
`;

const IconWrapper = styled.div`
  margin-top: 2px;
  svg {
    width: 22px;
    height: 22px;
  }
`;

const TextArea = styled.div`
  flex: 1;
  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
  p {
    margin: 0.2rem 0 0;
    font-size: 0.9rem;
    color: #333;
  }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: #555;
  cursor: pointer;
  transition: 0.2s;
  position: absolute;
  top: 8px;
  right: 8px;
  &:hover {
    color: #000;
  }
`;

const NotificationToast = ({
  id,
  type = "info",
  title,
  message,
  onClose,
  duration = 4000,
  isLeaving,
}) => {
  const icon =
    type === "info" ? (
      <Info color="#1e3a8a" />
    ) : type === "warning" ? (
      <AlertTriangle color="#facc15" />
    ) : type === "error" ? (
      <XCircle color="#ef4444" />
    ) : (
      <CheckCircle color="#22c55e" />
    );

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, onClose, duration]);

  return (
    <ToastBox type={type} isLeaving={isLeaving}>
      <IconWrapper>{icon}</IconWrapper>
      <TextArea>
        <h4>{title}</h4>
        <p>{message}</p>
      </TextArea>
      <CloseBtn onClick={() => onClose(id)}>
        <X size={18} />
      </CloseBtn>
    </ToastBox>
  );
};

export const ToastManager = ({ toasts, removeToast }) => (
  <ToastContainer>
    {toasts.map((toast) => (
      <NotificationToast
        key={toast.id}
        {...toast}
        onClose={removeToast}
        isLeaving={toast.isLeaving}
      />
    ))}
  </ToastContainer>
);

export default NotificationToast;
