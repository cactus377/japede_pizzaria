
import React from 'react';
import Icon from '../components/Icon';

interface PlaceholderPageProps {
  title: string;
  icon: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-orange-50/30 to-red-50/30">
      <div className="p-6 bg-white/50 rounded-full mb-6 border border-orange-100 shadow-md">
        <Icon name={icon} className="w-16 h-16 text-orange-500" />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-lg text-gray-500">Esta página está em construção.</p>
      <p className="mt-4 text-sm text-gray-400">Volte em breve para ver as novidades!</p>
    </div>
  );
};

export default PlaceholderPage;
