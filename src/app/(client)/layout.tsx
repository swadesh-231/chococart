import Footer from './_components/footer';
import Header from './_components/header';

/**
 * The storefront chrome. Every customer-facing page sits inside this, so pages
 * only ever describe their own content.
 */
export default function ClientLayout({ children }: LayoutProps<'/'>) {
    return (
        <>
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
        </>
    );
}
