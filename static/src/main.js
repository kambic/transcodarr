import 'flowbite';
import HTMX from 'htmx.org';
import Alpine from 'alpinejs';

// Expose HTMX globally for inline Django/htmx attributes
window.htmx = HTMX;

// Start Alpine
window.Alpine = Alpine;
Alpine.start();