import React from 'react';
import { Link } from 'react-router-dom';

interface RendezVousButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const RendezVousButton: React.FC<RendezVousButtonProps> = ({ onClick, className = '', children }) => {
  const content = children || 'RENDEZVOUS';
  const baseClass =
    'inline-block bg-[#d2ac35] text-white px-10 py-4 rounded-md font-bold text-lg tracking-wide mt-4 hover:bg-[#ffe48b] transition-colors duration-300 ' +
    className;

  return onClick ? (
    <button onClick={onClick} className={baseClass}>
      {content}
    </button>
  ) : (
    <Link to="/rendezvous" className={baseClass}>
      {content}
    </Link>
  );
};

export default RendezVousButton; 