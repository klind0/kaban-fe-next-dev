import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Logo } from '../icons/Logo'
import SignInForm from './sign-in-form'
import React from 'react';
import SignUpForm from './sign-up-form';
import GoogleAuthButton from './google-auth-button';
interface AuthModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
}

export default function AuthModal({ isOpen, onOpenChange }: AuthModalProps) {

    const [formType, setFormType] = React.useState<'signIn' | 'signUp'>('signIn')

    const toggleFormType = () => {
        setFormType((prev) => (prev === 'signIn' ? 'signUp' : 'signIn'))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-full rounded-none md:rounded-[24px] md:h-fit'>
                <DialogHeader className='sr-only'>
                    <DialogTitle>Sign in Modal</DialogTitle>
                    <DialogDescription>
                        Sign in modal
                    </DialogDescription>
                </DialogHeader>
                <div className='h-svh md:h-fit overflow-y-scroll'>
                    <div className='w-full mx-auto space-y-4 sm:px-4 pb-8'>
                        <div className='my-4'>
                            <Logo className='text-primary md:hidden' />
                        </div>
                        <div>
                            <h3 className='text-primary text-2xl md:text-[32px] text-center font-bold'>{formType === 'signIn' ? 'Welcome Back' : 'Get Started!'}</h3>
                        </div>

                        {formType === 'signIn' ? (
                            <SignInForm onOpenChange={onOpenChange} />
                        ) : (
                            <SignUpForm onOpenChange={onOpenChange} />
                        )}
                        <div className='space-y-6'>
                            <div className='flex items-center gap-3'>
                                <div className='h-px w-full bg-neutral-600'></div>
                                <span className='whitespace-nowrap'>Or continue with </span>
                                <div className='h-px w-full bg-neutral-600'></div>
                            </div>
                            <GoogleAuthButton onOpenChange={onOpenChange} isOpen={isOpen} />
                            <p className='text-center'>
                                {formType === 'signIn' ? 'Not registered yet?' : 'Already a member?'}
                                {' '}
                                <button onClick={toggleFormType} className='text-primary font-semibold hover:underline'>
                                    {formType === 'signIn' ? 'Sign Up' : 'Sign In'}
                                </button>
                            </p>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
