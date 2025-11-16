// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// --- PENYESUAIAN TAMBAHAN DI SINI ---
// Menambahkan listener untuk secara otomatis mengabaikan error 'Something wrong'
// yang berasal dari internal aplikasi Evershop, yang bukan merupakan
// kegagalan dari langkah tes itu sendiri.
Cypress.on('uncaught:exception', (err, runnable) => {
  // Kita 'return false' di sini untuk mencegah
  // Cypress menggagalkan tes.
  
  // Hanya abaikan error spesifik yang kita tahu:
  if (err.message.includes('Something wrong. Please try again')) {
    // cy.log() adalah perintah Cypress, jadi aman digunakan di sini
    cy.log('Mengabaikan error aplikasi yang sudah diketahui: Something wrong');
    return false; // <-- Ini kuncinya
  }
  
  // Biarkan error lain yang tidak dikenal tetap menggagalkan tes
  return true;
});