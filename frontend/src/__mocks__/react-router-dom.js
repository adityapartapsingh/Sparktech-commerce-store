import React from 'react';

export const BrowserRouter = ({ children }) => <div>{children}</div>;
export const MemoryRouter = ({ children }) => <div>{children}</div>;
export const Routes = ({ children }) => <div>{children}</div>;
export const Route = () => null;
export const Navigate = () => null;
export const Link = ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>;
export const NavLink = ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>;
export const useNavigate = () => () => {};
export const useLocation = () => ({ pathname: '/', search: '', hash: '', state: null });
export const useParams = () => ({});
export const useSearchParams = () => [new URLSearchParams(), () => {}];
