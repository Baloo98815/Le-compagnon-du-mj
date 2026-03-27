import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Confirmer l\'action',
    message: 'Êtes-vous sûr de vouloir continuer ?',
  };

  test('est visible quand isOpen=true', () => {
    render(<ConfirmDialog {...defaultProps} />);
    // ConfirmDialog utilise Modal en interne (data-testid="modal" ou "confirm-dialog")
    const dialog = screen.queryByTestId('confirm-dialog') || screen.queryByTestId('modal');
    expect(dialog).toBeInTheDocument();
  });

  test('n\'est pas visible quand isOpen=false', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    const dialog = screen.queryByTestId('confirm-dialog') || screen.queryByTestId('modal');
    expect(dialog).not.toBeInTheDocument();
  });

  test('affiche le titre et le message', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Confirmer l\'action')).toBeInTheDocument();
    expect(screen.getByText('Êtes-vous sûr de vouloir continuer ?')).toBeInTheDocument();
  });

  test('appelle onConfirm quand on confirme', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByTestId('confirm-btn'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('appelle onClose quand on annule', () => {
    const onClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('affiche les labels personnalisés', () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Oui, supprimer" cancelLabel="Non, garder" />);
    expect(screen.getByText('Oui, supprimer')).toBeInTheDocument();
    expect(screen.getByText('Non, garder')).toBeInTheDocument();
  });
});
