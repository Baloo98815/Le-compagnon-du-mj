import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatBlock from '../components/ui/StatBlock';

describe('StatBlock', () => {
  test('affiche le nom de la stat', () => {
    render(<StatBlock name="FOR" value={16} />);
    expect(screen.getByText('FOR')).toBeInTheDocument();
  });

  test('affiche la valeur', () => {
    render(<StatBlock name="FOR" value={16} />);
    expect(screen.getByText('16')).toBeInTheDocument();
  });

  test('calcule correctement le modificateur positif', () => {
    render(<StatBlock name="FOR" value={16} />);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  test('calcule correctement le modificateur nul', () => {
    render(<StatBlock name="DEX" value={10} />);
    expect(screen.getByText('+0')).toBeInTheDocument();
  });

  test('calcule correctement le modificateur négatif', () => {
    render(<StatBlock name="CON" value={8} />);
    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  test('affiche le bon testid', () => {
    render(<StatBlock name="FOR" value={16} />);
    expect(screen.getByTestId('stat-block-for')).toBeInTheDocument();
  });

  test('calcule modificateur pour 20 (+5)', () => {
    render(<StatBlock name="SAG" value={20} />);
    expect(screen.getByText('+5')).toBeInTheDocument();
  });
});
