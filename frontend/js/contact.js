const contactForm = document.querySelector('[data-contact-form]');
const contactStatus = document.querySelector('[data-contact-status]');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    contactStatus.textContent = 'Sending...';

    const payload = Object.fromEntries(new FormData(contactForm).entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Message failed.');
      }

      contactForm.reset();
      contactStatus.textContent = 'Thank you. Your message has been sent.';
    } catch (error) {
      contactStatus.textContent = error.message;
    }
  });
}
