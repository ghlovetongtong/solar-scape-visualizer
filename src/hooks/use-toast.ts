
import { message } from 'antd';

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  type?: 'success' | 'error' | 'info' | 'warning';
};

export function useToast() {
  const toast = (props: ToastProps) => {
    const { title, description, duration = 3, type = 'info' } = props;
    const content = description || title;
    
    if (content) {
      message[type](content, duration);
    }
    
    return {
      id: Date.now().toString(),
      dismiss: () => message.destroy(),
      update: () => {}
    };
  };

  return {
    toast,
    dismiss: message.destroy,
    toasts: []
  };
}

export const toast = {
  success: (content: React.ReactNode, duration?: number) => message.success(content, duration),
  error: (content: React.ReactNode, duration?: number) => message.error(content, duration),
  info: (content: React.ReactNode, duration?: number) => message.info(content, duration),
  warning: (content: React.ReactNode, duration?: number) => message.warning(content, duration),
  loading: (content: React.ReactNode, duration?: number) => message.loading(content, duration),
};
