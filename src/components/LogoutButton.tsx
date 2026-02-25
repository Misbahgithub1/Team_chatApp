import React from 'react'

type LogoutButtonProps = {
  onLogout: () => void
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  return (
    <button
      onClick={onLogout}
      className="logout-button"
      title="Logout"
    >
      Logout
    </button>
  )
}
