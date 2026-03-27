import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/ui/Button';

describe('Button', () => {
  test('affiche le texte du bouton', () => {
    render(<Button>Cliquez ici</Button>);
    expect(screen.getByText('Cliquez ici')).toBeInTheDocument();
  });

  test('appelle onClick quand cliqué', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Cliquer</Button>);
    fireEvent.click(screen.getByText('Cliquer'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('est désactivé quand disabled=true', () => {
    render(<Button disabled>Désactivé</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('n\'appelle pas onClick quand désactivé', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Désactivé</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('affiche un indicateur de chargement', () => {
    render(<Button loading>Chargement</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  test('a le type submit quand spécifié', () => {
    render(<Button type="submit">Envoyer</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  test('rend la variante danger', () => {
    render(<Button variant="danger">Supprimer</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('rend la variante secondary', () => {
    render(<Button variant="secondary">Annuler</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('rend la variante ghost', () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
