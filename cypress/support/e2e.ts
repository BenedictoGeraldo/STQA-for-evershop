// ***********************************************************
// File: cypress/support/e2e.ts (Final Version)
// ***********************************************************

import 'cypress-axe';
import './commands' 
// Catatan: index.d.ts baru yang Anda buat akan mengatasi error di bawah

// --- PENYESUAIAN TAMBAHAN UNCAUGHT EXCEPTION ---
Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Something wrong. Please try again')) {
    cy.log('Mengabaikan error aplikasi yang sudah diketahui: Something wrong');
    return false;
  }
  return true;
});


// =========================================================
// INTEGRASI WCAG/ACCESSIBILITY (CUSTOM LOGGING COMMAND)
// =========================================================

// Kita menggunakan tipe 'any' untuk stabilitas maksimum
Cypress.Commands.add('checkA11yWithLogging', (context: any, options: any) => {
    
    // Violation Callback (untuk logging)
    const customViolationCallback = (violations) => {
        if (violations && violations.length > 0) {
            cy.log('======================================================');
            cy.log('🚨 WCAG VIOLATIONS DITEMUKAN:');
            cy.log(`Total Pelanggaran: ${violations.length}`);
            cy.log('======================================================');
            
            violations.forEach(v => {
                cy.log(`--- PELANGGARAN: [${v.impact ? v.impact.toUpperCase() : 'UNKNOWN'}] ${v.id} ---`);
                cy.log(`Bantuan: ${v.helpUrl}`);
                cy.log(`Deskripsi Masalah: ${v.help}`);
                
                v.nodes.forEach(node => {
                    cy.log(`  > Elemen Melanggar (HTML): ${node.html.substring(0, 100)}...`);
                    cy.log(`  > Cara Memperbaiki: ${node.failureSummary}`);
                });
                cy.log('------------------------------------------------------');
            });
        }
    };

    // Panggil perintah checkA11y bawaan dengan violationCallback
    return cy.checkA11y(context, options, customViolationCallback);
});