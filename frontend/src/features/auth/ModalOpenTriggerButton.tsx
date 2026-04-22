import { Button } from 'flowbite-react';

const ModalOpenTriggerButton: React.FC<{
    onClick?: () => void;
    buttonText: string;
}> = ({ onClick, buttonText }) => {
    return (
        <>
            <Button
                pill
                size="xs"
                className="bg-[#CA6702] text-stone-100 md:text-md text-sm hover:bg-orange-400 hover:cursor-pointer transition-colors"
                onClick={onClick}
            >
                {buttonText}
            </Button>
        </>
    );
};

export default ModalOpenTriggerButton;
