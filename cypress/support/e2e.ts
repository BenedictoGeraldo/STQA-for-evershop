// ***********************************************************
// File: cypress/support/e2e.ts
// ***********************************************************

// Import commands.js using ES2015 syntax:
import 'cypress-axe';
import './commands'

// --- PENYESUAIAN TAMBAHAN UNCAUGHT EXCEPTION ---
Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Something wrong. Please try again')) {
    cy.log('Mengabaikan error aplikasi yang sudah diketahui: Something wrong');
    return false;
  }
  return true;
});


// =========================================================
// ✅ INTEGRASI WCAG/ACCESSIBILITY (CYPRESS-AXE)
// =========================================================

// Kita menggunakan 'originalFn as any' untuk mengatasi masalah tipe 
// pada 'then' karena TypeScript sering bingung dengan tipe Chainable dari override.

Cypress.Commands.overwrite('checkA11y', (originalFn, context, options) => {
    // Panggil originalFn dan casting ke 'any' untuk mengatasi Type Error 'then'
    // Kita harus MENGEMBALIKAN hasil dari pemanggilan originalFn ini.
    return (originalFn(context, options) as any).then((violations) => {
        if (violations && violations.length > 0) {
            cy.log('======================================================');
            cy.log('🚨 WCAG VIOLATIONS DITEMUKAN:');
            cy.log(`Total Pelanggaran: ${violations.length}`);
            cy.log('======================================================');
            
            violations.forEach(v => {
                cy.log(`--- PELANGGARAN: [${v.impact.toUpperCase()}] ${v.id} ---`);
                cy.log(`Bantuan: ${v.helpUrl}`);
                cy.log(`Deskripsi Masalah: ${v.help}`);
                
                v.nodes.forEach(node => {
                    cy.log(`  > Elemen Melanggar (HTML): ${node.html.substring(0, 100)}...`);
                    cy.log(`  > Cara Memperbaiki: ${node.failureSummary}`);
                });
                cy.log('------------------------------------------------------');
            });
            // Tidak perlu mengembalikan 'originalFn' lagi di sini
        } else {
             cy.log('🎉 WCAG Check Passed! Tidak ada pelanggaran yang ditemukan.');
        }
    });
});