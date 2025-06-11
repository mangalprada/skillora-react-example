import { NavLink } from 'react-router-dom';

function Header() {
  const linkClasses = ({ isActive }) =>
    `px-3 py-2 rounded hover:bg-gray-200 transition-colors ${
      isActive ? 'font-bold text-blue-600' : 'text-gray-800'
    }`;

  return (
    <header className="bg-white shadow fixed top-0 left-0 w-full z-50">
      <nav className="flex items-center gap-6 p-4">
        <h1 className="text-xl font-semibold">Skillora</h1>
        <NavLink to="/" className={linkClasses} end>
          Home
        </NavLink>
        <NavLink to="/ai-interview" className={linkClasses}>
          AI Interview
        </NavLink>
        <NavLink to="/my-interview" className={linkClasses}>
          My Interview
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
