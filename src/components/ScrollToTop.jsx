import { useRouter } from 'next/router';
import { useLayoutEffect } from 'react';

const ScrollToTop = () => {
    const { pathname } = useRouter();

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname]);

    return null;
}

export default ScrollToTop;