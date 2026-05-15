import { Button } from '../ui/button'
import Link from 'next/link'
import FormControl from '../universal/form-control'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { LOGIN_MUTATION } from '@/network/gql/auth.ql'
import { ILoginResponse, ILoginVariables } from '@/types/authTypes'
import { QUERY_KEY } from '@/enum/queryKeys'
import Cookies from 'js-cookie'
import { gqlRequest } from '@/network/graphql-client'
import { useUserStore } from '@/app/stores/user-store'
import { Checkbox } from '../ui/checkbox'

interface SignInFormProps {
    onOpenChange: () => void;
}
export default function SignInForm({ onOpenChange }: SignInFormProps) {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<ILoginVariables>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'all'
    })

    const { setUser, setRealtor } = useUserStore()

    const { mutateAsync: mutateLogin, isPending: isLoginPending } = useMutation({
        mutationFn: (variables: ILoginVariables) =>
            gqlRequest<ILoginResponse, ILoginVariables>(LOGIN_MUTATION, variables),
        onSuccess: (response) => {
            toast.success("Sign in successful!");
            const { accessToken, user, realtor } = response.login;
            Cookies.set(QUERY_KEY.ACCESS_TOKEN, accessToken, { expires: 30, secure: true });
            // Cookies.set(QUERY_KEY.REFRESH_TOKEN, refreshToken, { expires: 365, secure: true });
            setUser(user);
            setRealtor(realtor);
            reset();
            onOpenChange();
        },
        onError: (error) => (
            toast.error(error.message || "Something went wrong. Please try again.")
        )
    })

    const onSubmit = async (data: ILoginVariables) => {
        mutateLogin(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-4'>
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
                                labelText='Password'
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

            <Button type='submit' className='w-full' loading={isLoginPending}>
                Sign In
            </Button>
        </form>
    )
}
