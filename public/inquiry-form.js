document.querySelectorAll('[data-inquiry]').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const button = form.querySelector('button[type="submit"]');
      const status = form.querySelector('.form-status');
      button.disabled = true;
      status.textContent = 'Sending your inquiry…';
      try {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const result = await response.json();
        if (!response.ok || !result.ok || !result.reference) throw new Error(result.error || 'Your inquiry could not be saved. Please try again.');
        status.textContent = `Your ${result.type === 'training' ? 'training' : 'consultation'} inquiry has been received. Reference: ${result.reference}. This does not confirm a booking.`;
        form.reset();
      } catch (error) {
        status.textContent = error instanceof Error ? error.message : 'Your inquiry could not be saved. Please try again.';
      } finally {
        button.disabled = false;
        status.focus();
      }
    });
  });
