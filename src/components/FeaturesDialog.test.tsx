import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FeaturesDialog } from './FeaturesDialog';

describe('FeaturesDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  const renderDialog = (props = {}) => {
    return render(<FeaturesDialog {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should not render when isOpen is false', () => {
      renderDialog({ isOpen: false });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      renderDialog();

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Nyheter')).toBeInTheDocument();
    });

    it('should render close button', () => {
      renderDialog();

      expect(screen.getByRole('button', { name: 'Stäng' })).toBeInTheDocument();
    });

    it('should render all three features', () => {
      renderDialog();

      expect(screen.getByText('Slumpa recept')).toBeInTheDocument();
      expect(screen.getByText('Matlagningsläge')).toBeInTheDocument();
      expect(screen.getByText('Anpassa portioner')).toBeInTheDocument();
    });

    it('should render feature descriptions', () => {
      renderDialog();

      expect(screen.getByText(/kan inte bestämma dig/i)).toBeInTheDocument();
      expect(screen.getByText(/aktivera matlagningsläge/i)).toBeInTheDocument();
      expect(screen.getByText(/ändra antalet portioner/i)).toBeInTheDocument();
    });
  });

  describe('closing dialog', () => {
    it('should call onClose when clicking close button', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderDialog({ onClose });

      await user.click(screen.getByRole('button', { name: 'Stäng' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking backdrop', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const { container } = renderDialog({ onClose });

      const backdrop = container.querySelector('.features-dialog-backdrop');
      await user.click(backdrop!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when pressing Escape', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderDialog({ onClose });

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when clicking inside dialog', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderDialog({ onClose });

      await user.click(screen.getByText('Slumpa recept'));

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have correct aria attributes on dialog', () => {
      const { container } = renderDialog();

      const backdrop = container.querySelector('.features-dialog-backdrop');
      expect(backdrop).toHaveAttribute('role', 'dialog');
      expect(backdrop).toHaveAttribute('aria-modal', 'true');
      expect(backdrop).toHaveAttribute('aria-labelledby', 'features-dialog-title');
    });

    it('should have matching title id', () => {
      renderDialog();

      const title = screen.getByText('Nyheter');
      expect(title).toHaveAttribute('id', 'features-dialog-title');
    });
  });
});
