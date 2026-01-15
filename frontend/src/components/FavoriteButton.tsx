import { useState } from 'react';
import api from '../services/api';

interface FavoriteButtonProps {
    sitterId: number;
    initialIsFavorited: boolean;
    onToggle?: (newStatus: boolean) => void;
    className?: string; // Allow custom styling
}

export default function FavoriteButton({ sitterId, initialIsFavorited, onToggle, className }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [loading, setLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if inside a link
        e.stopPropagation();

        if (loading) return;
        setLoading(true);

        try {
            if (isFavorited) {
                await api.delete(`/api/users/me/favorites/${sitterId}`);
                setIsFavorited(false);
                if (onToggle) onToggle(false);
            } else {
                await api.post(`/api/users/me/favorites/${sitterId}`);
                setIsFavorited(true);
                if (onToggle) onToggle(true);
            }
        } catch (err) {
            console.error("Failed to toggle favorite", err);
            alert("Failed to update favorite status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`favorite-button ${className || ''}`}
            disabled={loading}
            title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: isFavorited ? '#e91e63' : '#ccc',
                padding: '5px',
                transition: 'transform 0.2s',
                ...((loading ? { opacity: 0.5 } : {}))
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
            {isFavorited ? '❤️' : '🤍'}
        </button>
    );
}
