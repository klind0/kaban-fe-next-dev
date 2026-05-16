import { Button } from '../ui/button'
import Link from 'next/link'
import FormControl from '../universal/form-control'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { SIGNUP_MUTATION } from '@/network/gql/auth.ql'
import { ISignUpResponse, ISignUpVariables } from '@/types/authTypes'
import { QUERY_KEY } from '@/enum/queryKeys'
import Cookies from 'js-cookie'
import { gqlRequest } from '@/network/graphql-client'
import { useUserStore } from '@/app/stores/user-store'
import { Checkbox } from '../ui/checkbox'
import { useRouter } from 'next/navigation' // Added for redirection

interface SignUpFormProps {
    onOpenChange: () => void;
}

export default function SignUpForm({ onOpenChange }: SignUpFormProps) {
    const router = useRouter(); // Initialize router
    const { control, handleSubmit, reset, formState: { errors } } = useForm<ISignUpVariables['input']>({
        defaultValues: {
            full_name: '',
            email: '',
            password: '',
            role: 1,
        },
        mode: 'all'
    })

    const { setUser, setRealtor } = useUserStore()

    const { mutateAsync: mutateSignUp, isPending: isSignUpPending } = useMutation({
        mutationFn: (variables: ISignUpVariables['input']) =>
            gqlRequest<ISignUpResponse, ISignUpVariables>(SIGNUP_MUTATION, { input: variables }),
        onSuccess: (response: any) => {
            console.log("Extraction Success Block Data:", response);

            // Target the object variables returned from the backend data payload
            const signupData = response?.signup;
            const token = signupData?.accessToken;
            
            if (token) {
                // 1. Set Auth Token Cookie
                Cookies.set(QUERY_KEY.ACCESS_TOKEN, token, { 
                    expires: 30, 
                    path: '/',
                    secure: true,
                    sameSite: 'lax'
                });

                // 2. Hydrate Global App Stores
                if (signupData.user) setUser(signupData.user);
                if (signupData.realtor) setRealtor(signupData.realtor);
                
                toast.success("Account created! Signing you in...");
                reset();
                onOpenChange();

                // 3. Force a reload to the dashboard to refresh the auth state                // to ensure the cookie is readable by the layout/middleware
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 800);
            } else {
                console.error("Token extraction failed. Response structure:", response);
                toast.error("Account created, but authentication token was dropped.");
            }
        },
        onError: (error: any) => {
            console.error("Signup Mutation Error Context:", error);
            toast.error(error.message || "Something went wrong. Please try again.");
        }
    })

    const onSubmit = async (data: ISignUpVariables['input']) => {
        await mutateSignUp(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* UI remains the same, but we added the logic above to handle the 'stuck' state */}
            <div className='flex items-center gap-3'>
                <div className='w-full h-px bg-neutral-600'></div>
                <span className='whitespace-nowrap font-medium text-sm'>Sign Up as a Realtor</span>
                <div className='w-full h-px bg-neutral-600'></div>
            </div>
            <div className='space-y-4'>
                <Controller
                    name="full_name"
                    control={control}
                    rules={{ required: 'Full name is required' }}
                    render={({ field }) => (
                        <FormControl
                            as='input'
                            labelText='Full Name'
                            placeholder='John Doe'
                            type='text'
                            {...field}
                            error={getErrorMessage(errors.full_name)}
                        />
                    )}
                />
                <Controller
                    name="email"
                    control={control}
                    rules={{
                        required: 'Email is required',
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Enter a valid email address',
                        },
                    }}
                    render={({ field }) => (
                        <FormControl
                            as='input'
                            labelText='Email address'
                            placeholder='you@example.com'
                            type='email'
                            {...field}
                            error={getErrorMessage(errors.email)}
                        />
                    )}
                />
                <div className='relative'> {/* Added relative wrapper to help with icon spacing */}
                    <Controller
                        name="password"
                        control={control}
                        rules={{
                            required: 'Password is required',
                            minLength: { value: 8, message: 'At least 8 characters' },
                        }}
                        render={({ field }) => (
                            <FormControl
                                as='input'
                                labelText='Create Password'
                                placeholder='xxxxxxxx'
                                type='password'
                                autoComplete='off'
                                {...field}
                                error={getErrorMessage(errors.password)}
                            />
                        )}
                    />
                </div>
                <div className='flex items-center justify-between mt-4'>
                    <div className='flex gap-2 items-center'>
                        <Checkbox id="keep-logged-in" /> 
                        <label htmlFor="keep-logged-in" className='text-sm font-medium cursor-pointer'>Keep me logged in</label>
                    </div>
                </div>
            </div>

            <Button type='submit' className='w-full py-6' loading={isSignUpPending}>
                Create Account
            </Button>
        </form>
    )
}