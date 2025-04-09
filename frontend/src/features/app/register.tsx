import React, { useEffect, useState, useRef } from 'react';
import { register } from '../../utils/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import {
    Button,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    TextInput,
} from 'flowbite-react';
import ModalOpenTriggerButton from './ModalOpenTriggerButton';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const navigate = useNavigate();
    const location = useLocation();

    const [openModal, setOpenModal] = useState(false);
    const usernameInputRef = useRef(null);

    useEffect(() => {
        if (isLoggedIn()) {
            navigate('/');
        }
        if (location.pathname === '/register') setOpenModal(true);
    }, []);

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setPassword2('');
        setEmail('');
    };

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        const { error } = await register(username, password, password2, email);
        if (error) {
            alert(JSON.stringify(error));
        } else {
            navigate('/');
            resetForm();
        }
    };

    return (
        <>
            <ModalOpenTriggerButton
                buttonText="Register"
                onClick={() => setOpenModal(true)}
            />
            <div className="">
                <Modal
                    id="register-modal"
                    show={openModal}
                    size="md"
                    popup
                    position="top-center"
                    dismissible
                    onClose={() => {
                        setOpenModal(false);
                        navigate('/');
                    }}
                    initialFocus={usernameInputRef}
                >
                    <ModalHeader>
                        <h3 className="text-xl font-medium text-gray-900 pl-4">
                            Sign up to our platform
                        </h3>
                    </ModalHeader>

                    <ModalBody>
                        <div className="space-y-6">
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <div className="mb-1 block">
                                        <Label htmlFor="username">
                                            Your username
                                        </Label>
                                    </div>
                                    <TextInput
                                        ref={usernameInputRef}
                                        type="text"
                                        id="username"
                                        autoComplete="username"
                                        maxLength={20}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        placeholder="Username (max 20 characters)"
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="mb-1 block mt-2">
                                        <Label htmlFor="password">
                                            Your password
                                        </Label>
                                    </div>
                                    <TextInput
                                        type="password"
                                        id="password"
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Password"
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="mb-1 block mt-2">
                                        <Label htmlFor="confirm-password">
                                            Repeat password
                                        </Label>
                                    </div>
                                    <TextInput
                                        type="password"
                                        id="confirm-password"
                                        onChange={(e) =>
                                            setPassword2(e.target.value)
                                        }
                                        placeholder="Confirm Password"
                                        required
                                    />
                                </div>
                                <div className="mb-1 block mt-2">
                                    <Label htmlFor="email">Email </Label>
                                </div>
                                <TextInput
                                    type="email"
                                    id="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    required
                                />

                                <p className="text-red-600">
                                    {password2 !== password
                                        ? 'Passwords do not match'
                                        : ''}
                                </p>
                                <div className="w-full pt-4">
                                    <Button
                                        type="submit"
                                        className="bg-orange-400"
                                    >
                                        Create new account
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </ModalBody>
                </Modal>
            </div>
        </>
    );
};

export default Register;
