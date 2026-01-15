import React, { useState, useEffect, useCallback } from 'react';
import api, { API_BASE_URL } from '../services/api';
import './ImageGallery.css';

type ProfileImage = {
    imageId: number;
    imageUrl: string;
    isAvatar: boolean;
};

type ImageGalleryProps = {
    images: ProfileImage[];
    onImageUpdate?: () => void;
    readonly?: boolean;
};

const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
};

export default function ImageGallery({ images, onImageUpdate, readonly = false }: ImageGalleryProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const handleSetAvatar = async (imageId: number) => {
        if (readonly) return;
        try {
            await api.put(`/api/users/me/profile-images/${imageId}/avatar`);
            onImageUpdate?.();
        } catch (error) {
            console.error('Failed to set avatar', error);
            alert('Failed to set avatar');
        }
    };

    const handleDelete = async (imageId: number) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;
        try {
            await api.delete(`/api/users/me/profile-images/${imageId}`);
            // If deleting the currently viewed image, close modal
            if (selectedImageIndex !== null) closeModal();
            onImageUpdate?.();
        } catch (error) {
            console.error('Failed to delete image', error);
            alert('Failed to delete image');
        }
    };

    // Modal Navigation
    const openModal = (index: number) => setSelectedImageIndex(index);
    const closeModal = () => setSelectedImageIndex(null);

    const nextImage = useCallback(async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImageIndex === null) return;
        setSelectedImageIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
    }, [selectedImageIndex, images.length]);

    const prevImage = useCallback(async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImageIndex === null) return;
        setSelectedImageIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
    }, [selectedImageIndex, images.length]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImageIndex === null) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeModal();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex, nextImage, prevImage]);

    if (images.length === 0) {
        return <p className="no-images-text">No profile images yet. Upload one above!</p>;
    }

    return (
        <>
            {/* Grid View */}
            <div className="image-gallery">
                {images.map((img, index) => (
                    <div
                        key={img.imageId}
                        className={`gallery-item ${img.isAvatar ? 'is-avatar' : ''}`}
                        onClick={() => openModal(index)}
                    >
                        <img
                            src={resolveImageUrl(img.imageUrl)}
                            alt={`Profile ${index}`}
                            className="gallery-image"
                        />
                        {img.isAvatar && <div className="avatar-badge">Avatar</div>}

                        {!readonly && (
                            <div className="gallery-overlay-controls">
                                {!img.isAvatar && (
                                    <button
                                        className="action-btn avatar"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSetAvatar(img.imageId);
                                        }}
                                        title="Set as Avatar"
                                    >
                                        ★
                                    </button>
                                )}
                                <button
                                    className="action-btn delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(img.imageId);
                                    }}
                                    title="Delete Image"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal Carousel */}
            {selectedImageIndex !== null && (
                <div className="modal-overlay" onClick={closeModal}>
                    <button className="modal-close-btn" onClick={closeModal}>×</button>

                    {images.length > 1 && (
                        <button className="modal-nav-btn prev" onClick={prevImage}>‹</button>
                    )}

                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={resolveImageUrl(images[selectedImageIndex].imageUrl)}
                            alt="Full View"
                            className="modal-image"
                        />
                    </div>

                    {images.length > 1 && (
                        <button className="modal-nav-btn next" onClick={nextImage}>›</button>
                    )}
                </div>
            )}
        </>
    );
}
