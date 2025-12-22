'use client'
import { useEffect } from 'react';
import stl from './Modal.module.scss';

const Modal = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={stl.modalOverlay} onClick={onClose}>
            <div className={stl.modalContent} onClick={e => e.stopPropagation()}>
                <button className={stl.closeButton} onClick={onClose}>×</button>
                {children}
            </div>
        </div>
    );
};

export default Modal; 