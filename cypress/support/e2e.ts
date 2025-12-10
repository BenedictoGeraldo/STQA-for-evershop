// ***********************************************************
// File: cypress/support/e2e.ts
// ***********************************************************

// Import commands.js using ES2015 syntax:
import 'cypress-axe';
import './commands'

// --- PENYESUAIAN TAMBAHAN UNCAUGHT EXCEPTION ---
Cypress.on('uncaught:exception', (err, runnable) => {
  // Abaikan error aplikasi "Something wrong. Please try again"
  // Jangan gunakan cy.log() atau console.log() di sini karena menyebabkan konflik
  if (err.message.includes('Something wrong. Please try again')) {
    return false;
  }
  return true;
});
// =========================================================
// ✅ INTEGRASI WCAG/ACCESSIBILITY (CYPRESS-AXE)
// =========================================================

Cypress.Commands.overwrite('checkA11y', (originalFn, context, options, violationCallback) => {
    
    // 1. Kita simpan logika logging ke dalam sebuah fungsi (callback)
    const loggerTampilan = (violations) => {
        if (violations && violations.length > 0) {
            cy.log('======================================================');
            cy.log('🚨 WCAG VIOLATIONS DITEMUKAN:');
            cy.log(`Total Pelanggaran: ${violations.length}`);
            cy.log('======================================================');
            
            violations.forEach(v => {
                // Menggunakan v.impact, v.id, dll sesuai kode asli teman Anda
                const impactText = v.impact ? v.impact.toUpperCase() : 'UNKNOWN';
                cy.log(`--- PELANGGARAN: [${impactText}] ${v.id} ---`);
                cy.log(`Bantuan: ${v.helpUrl}`);
                cy.log(`Deskripsi Masalah: ${v.help}`);
                
                v.nodes.forEach(node => {
                    // Mencegah error jika html kosong
                    const htmlText = node.html ? node.html.substring(0, 100) : 'Element not found';
                    cy.log(`  > Elemen Melanggar (HTML): ${htmlText}...`);
                    cy.log(`  > Cara Memperbaiki: ${node.failureSummary}`);
                });
                cy.log('------------------------------------------------------');
            });
        } else {
             cy.log('🎉 WCAG Check Passed! Tidak ada pelanggaran yang ditemukan.');
        }
    };

    // 2. Tentukan callback mana yang dipakai
    // Jika di script test ada callback khusus, pakai itu. Jika tidak, pakai loggerTampilan di atas.
    const finalCallback = violationCallback || loggerTampilan;

    // 3. PANGGIL FUNGSI ASLI (FIXED)
    // Perbaikan: Jangan gunakan .then(), tapi masukkan callback sebagai parameter ke-3/4.
    // Ini adalah cara resmi cypress-axe agar tidak crash "undefined".
    originalFn(context, options, finalCallback);
});