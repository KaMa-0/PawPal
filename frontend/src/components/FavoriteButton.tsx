import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import api from '../services/api';
import './FavoriteButton.css';

interface FavoriteButtonProps {
    sitterId: number;
    initialIsFavorited: boolean;
    onToggle?: (newStatus: boolean) => void;
    variant?: 'card' | 'inline'; // Different styles for different contexts
    className?: string;
}

export default function FavoriteButton({ 
    sitterId, 
    initialIsFavorited, 
    onToggle, 
    variant = 'card',
    className = '' 
}: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [loading, setLoading] = useState(false);

    // Sync state when prop changes (e.g., after data refresh)
    useEffect(() => {
        setIsFavorited(initialIsFavorited);
    }, [initialIsFavorited]);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
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
            className={`favorite-button favorite-button--${variant} ${className}`}
            disabled={loading}
            title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
            aria-label={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
        >
            <Heart 
                size={variant === 'card' ? 20 : 24} 
                className={`favorite-button__icon ${isFavorited ? 'favorite-button__icon--filled' : ''}`}
                fill={isFavorited ? 'currentColor' : 'none'}
            />
        </button>
    );
}
