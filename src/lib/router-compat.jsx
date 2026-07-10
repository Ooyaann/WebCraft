'use client';
// Shim kompatibilitas react-router-dom → next/navigation.
// Halaman lama hanya perlu mengganti baris import; API & perilaku sama.
import { useEffect } from 'react';
import NextLink from 'next/link';
import {
  useRouter,
  usePathname,
  useParams as useNextParams,
} from 'next/navigation';

export function useNavigate() {
  const router = useRouter();
  return (to, opts) => {
    if (typeof to === 'number') {
      if (to < 0) router.back();
      else router.forward();
      return;
    }
    if (opts?.replace) router.replace(to);
    else router.push(to);
  };
}

export const useParams = useNextParams;

export function useLocation() {
  const pathname = usePathname();
  return { pathname };
}

// <Navigate to="..." replace /> — redirect saat render, render kosong.
export function Navigate({ to, replace = false }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, replace]);
  return null;
}

export function Link({ to, children, ...rest }) {
  return (
    <NextLink href={to} {...rest}>
      {children}
    </NextLink>
  );
}

// NavLink dengan semantik aktif react-router (match path atau turunannya,
// kecuali `end`). className/children boleh berupa fungsi ({isActive}).
export function NavLink({ to, className, children, end = false, ...rest }) {
  const pathname = usePathname();
  const isActive = end
    ? pathname === to
    : pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));

  const resolvedClass =
    typeof className === 'function' ? className({ isActive }) : className;
  const resolvedChildren =
    typeof children === 'function' ? children({ isActive }) : children;

  return (
    <NextLink href={to} className={resolvedClass} {...rest}>
      {resolvedChildren}
    </NextLink>
  );
}
