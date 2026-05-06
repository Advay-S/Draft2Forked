const contactForm = document.querySelector('[data-contact-form]');
const contactStatus = document.querySelector('[data-contact-status]');
const isGithubPages = window.location.hostname.endsWith('github.io');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (isGithubPages) {
      contactStatus.textContent = 'This GitHub Pages preview is static. Please use the live backend deployment for contact form sending.';
      return;
    }

    contactStatus.textContent = 'Sending...';

    const payload = Object.fromEntries(new FormData(contactForm).entries());

    try {
      const response = await fetch('api/contact', {
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
