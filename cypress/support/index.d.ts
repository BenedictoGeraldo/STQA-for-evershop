// cypress/support/index.d.ts

// Kita perlu mendeklarasikan tipe untuk cypress-axe agar dikenali
declare namespace Cypress {
    interface Chainable<Subject = any> {
        /**
         * Menginjeksikan mesin axe-core ke DOM.
         */
        injectAxe(): Chainable<Subject>;

        /**
         * Menjalankan audit aksesibilitas (WCAG).
         * @param context Selektor CSS untuk elemen yang akan diaudit (default: seluruh dokumen).
         * @param options Opsi konfigurasi Axe-core.
         * @param violationCallback Fungsi yang akan dipanggil jika ada pelanggaran.
         * @param skipFailures Melewati kegagalan jika ada violations (default: false).
         */
        checkA11y(
            context?: string | HTMLElement | JQuery | null,
            options?: any,
            violationCallback?: (violations: any) => void,
            skipFailures?: boolean
        ): Chainable<any>;

        /**
         * Perintah Kustom untuk menjalankan checkA11y dan mencetak violations dengan logging yang diperbaiki.
         * Ini memperbaiki error type pada e2e.ts.
         */
        checkA11yWithLogging(
            context?: any, 
            options?: any
        ): Chainable<any>;
    }
}