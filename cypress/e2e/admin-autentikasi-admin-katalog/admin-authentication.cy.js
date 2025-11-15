// cypress/e2e/admin-authentication.cy.js

/**
 * ======================================================================
 * GRUP 1: Tes yang dimulai dari Halaman Login (Kondisi Logged-Out)
 * ======================================================================
 * Meliputi: TC-001 s/d TC-008 dan TC-010
 */
describe('Fitur: Autentikasi Admin - Kondisi Logged-Out', () => {

    /**
     * 'beforeEach' (hook)
     * Kode di dalam sini akan berjalan SEBELUM setiap 'it' (test case) dieksekusi.
     * Ini sempurna untuk mengunjungi halaman login, jadi kita tidak perlu
     * menulis cy.visit() di setiap 'it'.
     */
    beforeEach(() => {
        // Ganti '/admin/login' dengan URL halaman login admin Anda
        cy.visit('/admin/login');
    });
    
    it('TC-001: verifikasi login admin dengan email dan password yang valid', () => {
        cy.get('input[name="email"]').type('admin@email.com');
        cy.get('input[name="password"]').type('alferli04');
        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/admin');
    });

    it('TC-002: Verifikasi login admin dengan email valid dan password salah', () => {
        cy.get('input[name="email"]').type('admin@email.com');
        cy.get('input[name="password"]').type('password_salah');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/admin/login');
        cy.contains('Invalid email or password').should('be.visible');
    });

    it('TC-003: verifikasi login admin dengan email salah dan password valid', () => {   
        cy.get('input[name="email"]').type('admin@gmail.com');
        cy.get('input[name="password"]').type('admin123');
        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/admin/login');
        cy.contains('Invalid email or password').should('be.visible');
    });

    it('TC-004: verifikasi login dengan semua field kosong', () => {     
        cy.get('button[type="submit"]').click();

        cy.contains('This field can not be empty').should('be.visible');
        cy.contains('This field can not be empty').should('be.visible');
    });

    it('TC-005: verifikasi login dengan email valid dan field password kosong', () =>{
        cy.get('input[name="email"]').type('admin@email.com');
        cy.get('button[type="submit"]').click();

        cy.contains('This field can not be empty').should('be.visible');
    });

    it('TC-006: verifikasi login dengan field email kosong dan password valid', () =>{
        cy.get('input[name="password"]').type('alferli04');
        cy.get('button[type="submit"]').click();
        cy.contains('This field can not be empty').should('be.visible');
    });

    it('TC-007: verifikasi login dengan format email yang tidak valid', () =>{
        cy.get('input[name="email"]').type('admin@.com'); 
        cy.get('input[name="password"]').type('alferli04');
        cy.get('button[type="submit"]').click();
        cy.contains('Invalid email').should('be.visible');
    });

    it('TC-008: verifikasi input password disembunyikan', () => {
        cy.get('input[name="password"]')
          .type('admin123') // Input 
          .should('have.attr', 'type', 'password');
    });

it('TC-010: verifikasi validasi sesi setelah logout', () => {
    cy.visit('/admin'); 
    cy.url().should('include', '/admin/login');
    cy.get('input[name="email"]').should('be.visible');
});

});


/**
 * ======================================================================
 * GRUP 2: Tes yang dimulai dari Halaman Dashboard (Kondisi Logged-In)
 * ======================================================================
 * Meliputi: TC-009 (dan nanti TC-011, dst.)
 */
it('TC-009: verifikasi fungsionalitas logout sukses', () => {

    // 1. Kunjungi halaman login dulu
    cy.visit('/admin/login');

    // 2. Login sebagai admin
    cy.get('input[name="email"]').type('admin@email.com');
    cy.get('input[name="password"]').type('alferli04');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/admin');

    cy.get('a.first-letter').click();

    cy.get('a.text-critical').click();

    cy.url().should('include', '/admin/login');
});
