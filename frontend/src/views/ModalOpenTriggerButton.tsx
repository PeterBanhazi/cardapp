const ModalOpenTriggerButton: React.FC<{
    onClick: () => void;
    buttonText: string;
}> = ({ onClick, buttonText }) => {
    return (
        <>
            <button
                className="bg-[#CA6702] text-stone-100 px-3 py-1 rounded-xl text-md font-medium hover:bg-orange-400 hover:cursor-pointer transition-colors"
                onClick={onClick}
            >
                <div className="-translate-y-[1px]">{buttonText}</div>
            </button>
        </>
    );
};

export default ModalOpenTriggerButton;
