import React from 'react'
import { Button } from '../ui/button'
import { Google } from '../icons/google'
import { useUserStore } from '@/app/stores/user-store'
import { ILoginWithGoogleResponse, ILoginWithGoogleVariables } from '@/types/authTypes'
import { toast } from 'sonner'
import { LOGIN_WITH_GOOGLE_MUTATION } from '@/network/gql/auth.ql'
import { useMutation } from '@tanstack/react-query'
import { gqlRequest } from '@/network/graphql-client'
import { QUERY_KEY } from '@/enum/queryKeys'
import Cookies from 'js-cookie';

interface GoogleAuthProps {
    onOpenChange: () => void;
    isOpen: boolean;
}

export default function GoogleAuthButton({ onOpenChange, isOpen }: GoogleAuthProps) {
    const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
    const { setUser, setRealtor } = useUserStore()

    const { mutateAsync: mutateLoginWithGoogle, isPending: isGoogleLoginPending } = useMutation({
        mutationFn: (variables: ILoginWithGoogleVariables) =>
            gqlRequest<ILoginWithGoogleResponse, ILoginWithGoogleVariables>(LOGIN_WITH_GOOGLE_MUTATION, variables),
        onSuccess: (response) => {
            toast.success("Logged in successfully!");
            const { accessToken, user, realtor } = response.loginWithGoogle;
            Cookies.set(QUERY_KEY.ACCESS_TOKEN, accessToken, { expires: 30, secure: true });
            setUser(user);
            setRealtor(realtor);
            onOpenChange();
        },
        onError: (error) => {
            toast.error(error.message || "Something went wrong. Please try again.");
        },
        onSettled: () => {
            setIsGoogleLoading(false);
        }
    })

    // Ref to hold the latest callback so the GIS initialization doesn't suffer from stale closures
    const googleCallbackRef = React.useRef<((credential: string) => void) | undefined>(undefined);
    googleCallbackRef.current = (credential: string) => {
        mutateLoginWithGoogle({ idToken: credential });
    };

    // Track whether GIS has been initialized
    const gisInitializedRef = React.useRef(false);
    // Track the popup window reference
    const googlePopupRef = React.useRef<Window | null>(null);

    // Listen for postMessage from the Google OAuth popup
    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'GOOGLE_ID_TOKEN' && event.data.idToken) {
                setIsGoogleLoading(true);
                googleCallbackRef.current?.(event.data.idToken);
                googlePopupRef.current = null;
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Initialize Google Identity Services whenever the modal opens
    React.useEffect(() => {
        if (!isOpen) return;

        const initGoogleSignIn = () => {
            if (!window.google) return;

            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                callback: (response) => {
                    googleCallbackRef.current?.(response.credential);
                },
            });
            gisInitializedRef.current = true;
        };

        // The GIS script may already be loaded
        if (window.google) {
            initGoogleSignIn();
        } else {
            // Wait for the script to load
            const interval = setInterval(() => {
                if (window.google) {
                    initGoogleSignIn();
                    clearInterval(interval);
                }
            }, 200);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const handleGoogleLogin = React.useCallback(() => {
        if (!window.google || !gisInitializedRef.current) {
            toast.error('Google Sign-In is not ready yet. Please try again in a moment.');
            return;
        }
        setIsGoogleLoading(true);
        window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Fallback: open Google sign-in in a popup manually
                const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
                const redirectUri = window.location.origin;
                const scope = 'openid email profile';
                const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
                    `client_id=${clientId}` +
                    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                    `&response_type=id_token` +
                    `&scope=${encodeURIComponent(scope)}` +
                    `&nonce=${crypto.randomUUID()}`;
                const popup = window.open(url, 'google-signin', 'width=500,height=600');
                if (popup) {
                    googlePopupRef.current = popup;
                } else {
                    setIsGoogleLoading(false);
                    toast.error('Please allow popups for Google Sign-In.');
                }
            }
            if (notification.isDismissedMoment()) {
                setIsGoogleLoading(false);
            }
        });
    }, []);
    return (
        <Button variant={'outline'} className='w-full' loading={isGoogleLoading || isGoogleLoginPending} onClick={handleGoogleLogin}>
            <Google />Google
        </Button>
    )
}
