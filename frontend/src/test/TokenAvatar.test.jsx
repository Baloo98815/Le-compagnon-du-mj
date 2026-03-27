import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TokenAvatar from '../components/ui/TokenAvatar';

describe('TokenAvatar', () => {
  test('affiche les initiales quand pas d\'image', () => {
    render(<TokenAvatar name="Aragorn" />);
    const avatar = screen.getByTestId('token-avatar');
    expect(avatar).toBeInTheDocument();
    // Un seul mot → première lettre du mot
    expect(avatar.textContent).toContain('A');
  });

  test('affiche l\'image quand une URL est fournie', () => {
    render(<TokenAvatar name="Aragorn" image="/token.png" />);
    const img = screen.queryByRole('img');
    expect(img).toBeInTheDocument();
  });

  test('affiche les initiales d\'un nom à un mot', () => {
    render(<TokenAvatar name="Gandalf" />);
    const avatar = screen.getByTestId('token-avatar');
    // Un seul mot → première lettre uniquement
    expect(avatar.textContent).toContain('G');
  });

  test('affiche deux initiales pour un nom composé', () => {
    render(<TokenAvatar name="Legolas Vertefeuille" />);
    const avatar = screen.getByTestId('token-avatar');
    expect(avatar.textContent).toContain('LV');
  });

  test('ne plante pas avec un nom vide', () => {
    render(<TokenAvatar name="" />);
    expect(screen.getByTestId('token-avatar')).toBeInTheDocument();
  });

  test('supporte les différentes tailles', () => {
    const { rerender } = render(<TokenAvatar name="Test" size="sm" />);
    expect(screen.getByTestId('token-avatar')).toBeInTheDocument();
    rerender(<TokenAvatar name="Test" size="lg" />);
    expect(screen.getByTestId('token-avatar')).toBeInTheDocument();
  });
});
