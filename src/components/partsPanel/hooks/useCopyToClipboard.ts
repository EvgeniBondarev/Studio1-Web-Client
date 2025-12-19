import { message } from 'antd';

export const useCopyToClipboard = () => {
    const copyValue = async (value: string): Promise<boolean> => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = value;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            message.success('Скопировано');
            return true;
        } catch {
            message.error('Не удалось скопировать');
            return false;
        }
    };

    const handleCopy = (event: React.MouseEvent<HTMLElement>, value?: string | null) => {
        event.stopPropagation();
        if (!value) {
            return;
        }
        return copyValue(value);
    };

    return {
        copyValue,
        handleCopy,
    };
};