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

interface SignUpFormProps {
    onOpenChange: () => void;
}
export default function SignUpForm({ onOpenChange }: SignUpFormProps) {
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
        onSuccess: (response) => {
            toast.success("Signed up successfully!");
            const { accessToken, user, realtor } = response.signup;
            Cookies.set(QUERY_KEY.ACCESS_TOKEN, accessToken, { expires: 30, secure: true });
            setUser(user);
            setRealtor(realtor);
            reset();
            onOpenChange();
        },
        onError: (error) => (
            toast.error(error.message || "Something went wrong. Please try again.")
        )
    })

    const onSubmit = async (data: ISignUpVariables['input']) => {
        mutateSignUp(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='flex items-center gap-3'>
                <div className='w-full h-px bg-neutral-600'></div>
                <span className='whitespace-nowrap font-medium'>Sign Up as a Realtor</span>
                <div className='w-full h-px bg-neutral-600'></div>
            </div>
            <div className='space-y-4'>
                <Controller
                    name="full_name"
                    control={control}
                    rules={{
                        required: 'Full name is required',
                    }}
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
                <div>
                    <Controller
                        name="password"
                        control={control}
                        rules={{
                            required: 'Password is required',
                            minLength: {
                                value: 8,
                                message: 'Password must be at least 8 characters',
                            },
                        }}
                        render={({ field }) => (
                            <FormControl
                                as='input'
                                labelText='Create Password'
                                placeholder='xxxxxxxxxxxxxxx'
                                type='password'
                                autoComplete='off'
                                {...field}
                                error={getErrorMessage(errors.password)}
                            />
                        )}
                    />
                    <div className='flex items-center justify-between mt-4'>
                        <div className='flex gap-2 items-center'><Checkbox /> <span className='font-medium'>Keep me logged in</span></div>
                        <Link href='#' className='text-sm text-primary font-semibold hover:underline'>Forgot password?</Link>
                    </div>
                </div>
            </div>

            <Button type='submit' className='w-full' loading={isSignUpPending}>
                Sign Up
            </Button>
        </form>
    )
}
