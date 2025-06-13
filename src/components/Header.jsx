import { NavLink } from 'react-router-dom';

function Header() {
  const linkClasses = ({ isActive }) =>
    `px-3 py-2 rounded ${isActive ? ' font-bold text-teal-500' : 'text-white'}`;

  return (
    <header className="bg-black shadow fixed top-0 left-0 w-full z-50">
      <nav className="flex items-center gap-6 p-4">
        <NavLink to="/" className={linkClasses} end>
          Home
        </NavLink>
        <NavLink to="/ai-interview" className={linkClasses}>
          AI Interview
        </NavLink>
        <NavLink to="/custom-create-interview" className={linkClasses}>
          Custom Create Interview
        </NavLink>
        <NavLink to="/my-interview" className={linkClasses}>
          My Interview
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
