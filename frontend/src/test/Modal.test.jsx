import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../components/ui/Modal';

describe('Modal', () => {
  test('n\'est pas visible quand isOpen=false', () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="Test"><p>Contenu</p></Modal>);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  test('est visible quand isOpen=true', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Test"><p>Contenu</p></Modal>);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  test('affiche le titre', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Mon titre"><p>ok</p></Modal>);
    expect(screen.getByText('Mon titre')).toBeInTheDocument();
  });

  test('affiche le contenu enfant', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Test"><p>Mon contenu</p></Modal>);
    expect(screen.getByText('Mon contenu')).toBeInTheDocument();
  });

  test('appelle onClose quand on clique sur le bouton fermer', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="Test"><p>ok</p></Modal>);
    fireEvent.click(screen.getByTestId('modal-close-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('appelle onClose avec la touche Escape', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="Test"><p>ok</p></Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
