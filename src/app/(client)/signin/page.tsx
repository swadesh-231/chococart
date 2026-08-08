import Header from '../_components/header';
import SignInForm from './signin-form';

export default async function SignInPage({ searchParams }: PageProps<'/signin'>) {
    const { callbackUrl } = await searchParams;
    const redirectTo =
        typeof callbackUrl === 'string' && callbackUrl.startsWith('/') ? callbackUrl : '/';

    return (
        <>
            <Header />
            <main className="flex flex-1 items-center justify-center bg-ivory-dim px-5 py-16 md:py-24">
                <SignInForm callbackUrl={redirectTo} />
            </main>
        </>
    );
}
