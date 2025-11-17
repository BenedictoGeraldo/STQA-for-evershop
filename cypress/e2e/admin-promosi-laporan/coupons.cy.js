/// <reference types="cypress" />

const baseUrl = "http://localhost:3002/admin";
const loginEmail = "admin@email.com";
const loginPass = "123123123";

// Fungsi login sekali
function adminLogin() {
  cy.visit(baseUrl + "/login");
  cy.get('input[name="email"]').type(loginEmail);
  cy.get('input[name="password"]').type(loginPass);
  cy.get('button[type="submit"]').click();
  cy.wait(1000);
  cy.url().should('include', "/admin");
}

// Fungsi refresh dan clear filter pada halaman coupons dengan jeda tunggu
function refreshCouponList() {
  cy.wait(1000); // memberi jeda agar proses backend selesai/sinkron
  cy.visit(baseUrl + '/coupons');
  cy.reload();
  cy.get('input[name="coupon"][placeholder="Search"]').clear();
}

describe("Coupons Module E2E", () => {

  beforeEach(() => {
    adminLogin();
  });

  // TC001 Membuka halaman Coupon List
  it("TC001 - Membuka halaman Coupon List", () => {
    refreshCouponList();
    cy.contains("New Coupon").should("exist");
  });

  // TC002 Membuka halaman New Coupon
  it("TC002 - Membuka halaman New Coupon", () => {
    refreshCouponList();
    cy.contains("New Coupon").click();
    cy.url().should("include", "/coupon/new");
  });

  // TC003 Menambah Kupon Baru (Valid & Lengkap)
  it('TC003 - Menambah kupon baru (valid & lengkap)', () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('DISKON10');
    cy.get('textarea[name="description"]').type('Diskon 10% promo');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2025-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('50000');
    cy.get('input[name="condition[order_qty]"]').type('2');
    cy.get('input[name="user_condition[purchased]"]').type('100000');
    cy.contains('button', 'Save', { timeout: 10000 }).click();

    refreshCouponList();
    cy.contains('DISKON10', { timeout: 10000 }).should('exist');
  });

  // TC004 Validasi kupon tanpa kode (invalid)
  it("TC004 - Validasi kupon tanpa kode", () => {
    cy.visit(baseUrl + "/coupon/new");
    cy.get('textarea[name="description"]').type('Tanpa kode');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2025-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('50000');
    cy.get('input[name="condition[order_qty]"]').type('2');
    cy.get('input[name="user_condition[emails]"]').type('user@email.com');
    cy.get('input[name="user_condition[purchased]"]').type('100000');
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    cy.contains("This field can not be empty", { timeout: 10000 }).should("exist");
  });

  // TC005 Validasi tanggal tidak logis (invalid)
  it("TC005 - Validasi tanggal tidak logis", () => {
    cy.visit(baseUrl + "/coupon/new");
    cy.get('input[name="coupon"]').type('TGLINVALID');
    cy.get('textarea[name="description"]').type('Tanggal tidak logis');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-20', { force: true });
    cy.get('input[name="end_date"]').type('2025-11-10', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('50000');
    cy.get('input[name="condition[order_qty]"]').type('2');
    cy.get('input[name="user_condition[emails]"]').type('user@email.com');
    cy.get('input[name="user_condition[purchased]"]').type('100000');
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    refreshCouponList();
    cy.contains('TGLINVALID', { timeout: 10000 }).should('exist');
  });

  // TC006 Menambah kupon tipe diskon persentase
  it("TC006 - Menambah kupon dengan tipe diskon persentase", () => {
    cy.visit(baseUrl + "/coupon/new");
    cy.get('input[name="coupon"]').type('PERSEN20');
    cy.get('textarea[name="description"]').type('Diskon 20 persen');
    cy.get('input[name="discount_amount"]').type('20');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2025-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('0');
    cy.get('input[name="condition[order_qty]"]').type('1');
    cy.contains('button', 'Save', { timeout: 10000 }).click();

    refreshCouponList();
    cy.contains('PERSEN20', { timeout: 10000 }).should('exist');
  });

  // TC007 Menambah kupon dengan pembelian minimum
  it("TC007 - Menambah kupon dengan pembelian minimum", () => {
    cy.visit(baseUrl + "/coupon/new");
    cy.get('input[name="coupon"]').type('MINBUY100K');
    cy.get('textarea[name="description"]').type('Min pembelian 100 ribu');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2025-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('100000');
    cy.get('input[name="condition[order_qty]"]').type('1');
    cy.get('input[name="user_condition[purchased]"]').type('100000');
    cy.contains('button', 'Save').click();

    refreshCouponList();
    cy.contains('MINBUY100K', { timeout: 10000 }).should('exist');
  });

  // TC008 Kupon untuk pelanggan tertentu
  it("TC008 - Menambah kupon untuk pelanggan tertentu", () => {
    cy.visit(baseUrl + "/coupon/new");
    cy.get('input[name="coupon"]').type('USERONLY');
    cy.get('textarea[name="description"]').type('Khusus user@email.com');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2025-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('0');
    cy.get('input[name="condition[order_qty]"]').type('1');
    cy.get('input[name="user_condition[emails]"]').type('user@email.com');
    cy.get('input[name="user_condition[purchased]"]').type('100000');
    cy.contains('button', 'Save', { timeout: 10000 }).click();

    refreshCouponList();
    cy.contains('USERONLY', { timeout: 10000 }).should('exist');
  });

  // TC009 Membatalkan pembuatan kupon
  it("TC009 - Membatalkan pembuatan kupon", () => {
    cy.visit(baseUrl + "/coupon/new");
    cy.get('input[name="coupon"]').type('CANCELKU');
    cy.get('textarea[name="description"]').type('Akan dibatalkan');
    cy.contains('button', 'Cancel').click();
    cy.url().should('include', '/coupons');
  });

  // TC010 Edit data kupon
  it("TC010 - Edit data kupon", () => {
    refreshCouponList();
    cy.contains('DISKON10').click();
    cy.get('input[name="discount_amount"]').clear().type('15');
    cy.contains('button', 'Save').click();

    refreshCouponList();
    cy.contains('DISKON10', { timeout: 10000 }).should('exist');
  });

  // TC011 Menghapus kupon
  it("TC011 - Menghapus kupon", () => {
    refreshCouponList();
    cy.contains('USERONLY').parents('tr').within(() => {
      cy.get('input[type="checkbox"]').check({ force: true });
    });
    cy.contains('a', 'Delete').click({ force: true });
    // Jika muncul modal konfirmasi, bisa tambahkan baris berikut
    cy.contains('button', 'Delete', { timeout: 10000 }).click();
    refreshCouponList();
    cy.contains('USERONLY').should('not.exist');
  });

  // TC012 Ubah status aktif/nonaktif kupon
  it("TC012 - Mengubah status aktif/nonaktif kupon", () => {
    refreshCouponList();
    cy.contains('DISKON10').click();
    cy.get('.toggle').click();
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    refreshCouponList();
    cy.contains('DISKON10').parents('tr').find('.dot').should('exist');
  });

  // TC013 Cari kupon di daftar
  it("TC013 - Mencari kupon di daftar", () => {
    refreshCouponList();
    cy.get('input[name="coupon"][placeholder="Search"]').type('DISKON10');
    cy.wait(1000);
    cy.get('table').contains('DISKON10', { timeout: 10000 }).should('exist');
  });

});
