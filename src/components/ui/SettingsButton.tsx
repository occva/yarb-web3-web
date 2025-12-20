import React from 'react';
import { Settings } from 'lucide-react';
import { SettingsButtonProps } from '../../types';
import './SettingsButton.css';

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <button 
      className="settings-button" 
      onClick={onClick} 
      title="仓库设置"
      aria-label="打开仓库设置"
    >
      <Settings size={20} />
    </button>
  );
};

export default SettingsButton;

