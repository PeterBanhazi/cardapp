import { Button } from 'flowbite-react';

const ModalOpenTriggerButton: React.FC<{
    onClick?: () => void;
    buttonText: string;
    linkTo?: string;
}> = ({ onClick, buttonText, linkTo }) => {
    return (
        <>
            <Button
                className="bg-[#CA6702] text-stone-100 lg:px-3 xl:py-1 md:text-md xl:text-base xl:tracking-wider lg:font-semibold text-sm py-1 px-1.5 rounded-xl hover:bg-orange-400 hover:cursor-pointer transition-colors"
                onClick={onClick}
            >
                <div className="-translate-y-[1px]">{buttonText}</div>
            </Button>
        </>
    );
};

export default ModalOpenTriggerButton;
