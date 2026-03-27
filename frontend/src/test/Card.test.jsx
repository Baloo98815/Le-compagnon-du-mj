import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from '../components/ui/Card';

describe('Card', () => {
  test('affiche le contenu enfant', () => {
    render(<Card><p>Contenu de la carte</p></Card>);
    expect(screen.getByText('Contenu de la carte')).toBeInTheDocument();
  });

  test('affiche le titre quand fourni', () => {
    render(<Card title="Ma Carte">Contenu</Card>);
    expect(screen.getByText('Ma Carte')).toBeInTheDocument();
  });

  test('affiche le testid card', () => {
    render(<Card>Contenu</Card>);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  test('appelle onClick quand cliqué (si fourni)', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Cliquable</Card>);
    fireEvent.click(screen.getByTestId('card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('affiche les actions', () => {
    render(<Card actions={<button>Action</button>}>Contenu</Card>);
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});
