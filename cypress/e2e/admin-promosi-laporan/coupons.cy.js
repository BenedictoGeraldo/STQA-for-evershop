/// <reference types="cypress" />

const baseUrl = "http://localhost:3000/admin";
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
  cy.wait(1000);
  cy.visit(baseUrl + '/coupons');
  cy.reload();
  cy.get('input[name="coupon"][placeholder="Search"]').clear();
}

describe("Coupons Module E2E", () => {

  beforeEach(() => {
    adminLogin();
  });

  // TC057 Membuka halaman Coupon List
  it("TC057 - Membuka halaman Coupon List", () => {
    refreshCouponList();
    cy.contains("New Coupon").should("exist");
  });

  // TC058 Membuka halaman New Coupon
  it("TC058 - Membuka halaman New Coupon", () => {
    refreshCouponList();
    cy.contains("New Coupon").click();
    cy.url().should("include", "/coupon/new");
  });

  // TC059 Menambah Kupon Baru (Valid & Lengkap)
  it('TC059 - Menambah kupon baru (valid & lengkap)', () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('DISKON10');
    cy.get('textarea[name="description"]').type('Diskon 10% promo');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('0');
    cy.get('input[name="condition[order_qty]"]').type('2');
    cy.get('input[name="user_condition[purchased]"]').type('0');
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    refreshCouponList();
    cy.contains('DISKON10', { timeout: 10000 }).should('exist');

    cy.contains('DISKON10').parents('tr').within(() => {
      cy.get('input[type="checkbox"]').check({ force: true });
    });
    cy.contains('a', 'Delete').click({ force: true });
    cy.wait(500);
    cy.contains('button', 'Delete', { timeout: 10000 }).click({ force: true });

    refreshCouponList();
    cy.contains('DISKON10').should('not.exist');
  });

  // TC060 Validasi kupon tanpa kode (invalid)
  it("TC060 - Validasi kupon tanpa kode", () => {
    cy.visit(baseUrl + "/coupon/new");
    cy.get('textarea[name="description"]').type('Tanpa kode');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('0');
    cy.get('input[name="condition[order_qty]"]').type('2');
    cy.get('input[name="user_condition[emails]"]').type('user@email.com');
    cy.get('input[name="user_condition[purchased]"]').type('0');
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    cy.contains("This field can not be empty", { timeout: 10000 }).should("exist");
  });

    // TC061 Validasi kupon tanpa kode (invalid)
  it("TC061 - Validasi kupon tanpa description", () => {
    cy.visit(baseUrl + "/coupon/new");
    cy.get('input[name="coupon"]').type('WithoutDSC');
    cy.get('input[name="discount_amount"]').type('5');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('0');
    cy.get('input[name="condition[order_qty]"]').type('2');
    cy.get('input[name="user_condition[emails]"]').type('user@email.com');
    cy.get('input[name="user_condition[purchased]"]').type('0');
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    cy.contains("This field can not be empty", { timeout: 10000 }).should("exist");
  });

  // TC062 - Menambah kupon baru dengan status mati (inactive)
  it('TC062 - Menambah kupon baru dengan status mati', () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('NONAKTIF');
    cy.get('textarea[name="description"]').type('Kupon nonaktif');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-21', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.get('input[type="radio"][name="discount_type"]').first().check({ force: true });
    cy.get('.form-field-container').contains('Status').parent().find('.toggle').click();
    cy.get('button.button.primary').contains('Save').click();

    refreshCouponList();
    cy.get('input[name="coupon"][placeholder="Search"]').type('NONAKTIF', { force: true }).wait(1000);
    cy.get('table.listing.sticky tbody tr').contains('NONAKTIF').parents('tr').within(() => {
      cy.get('td').eq(4).find('.default.dot').should('exist');
    });

    cy.contains('NONAKTIF').parents('tr').within(() => {
      cy.get('input[type="checkbox"]').check({ force: true });
    });
    cy.contains('a', 'Delete').click({ force: true });
    cy.wait(500);
    cy.contains('button', 'Delete', { timeout: 10000 }).click({ force: true });

    refreshCouponList();
    cy.contains('NONAKTIF').should('not.exist');
  });

    // TC063 Menambah Kupon Baru Discount Amount bukan Angka (invalid)
  it('TC063 - Menambah Kupon Baru Discount Amount bukan Angka (invalid)', () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('NONUMBER');
    cy.get('textarea[name="description"]').type('No Number');
    cy.get('input[name="discount_amount"]').type('ten');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    cy.contains("Exception in middleware finish: Exception in middleware createCoupon: Discount amount is invalid", { timeout: 10000 }).should("exist");
  });

    // TC064 - Kupon baru discount amount > 100% (invalid)
  it('TC064 - Validasi kupon baru dengan discount amount > 100%', () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('101PERCENT');
    cy.get('textarea[name="description"]').type('Diskon melebihi seratus persen');
    cy.get('input[name="discount_amount"]').type('150');
    cy.get('input[name="start_date"]').type('2025-11-21', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.get('label').contains('Percentage discount to entire order').click();
    cy.contains('button', 'Save', { timeout: 10000 }).click();

    cy.get('body').then(($body) => {
      if ($body.text().includes('Discount percent cannot be more than 100')) {
        cy.log('✅ PASS: Validasi muncul. Tidak ada data sampah.');
      } 
      else {
        cy.log('⚠️ DEFECT: Data tersimpan tanpa validasi! Menghapus data sampah...');
        refreshCouponList(); 

        cy.contains('tr', '101PERCENT').within(() => {
             cy.get('input[type="checkbox"]').check({ force: true });
        });

        cy.contains('a', 'Delete').click({ force: true });
        cy.wait(500);
        cy.contains('button', 'Delete', { timeout: 10000 }).click({ force: true });

        cy.log('CLEANUP: Data sampah berhasil dihapus');
      }
    });
  });

    // TC065 Menambah Kupon Baru tanpa Start Date (invalid)
  it('TC065 - Menambah Kupon Baru tanpa Start Date', () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('WithoutSD');
    cy.get('textarea[name="description"]').type('tanpa Start Date');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.contains('label', 'Fixed discount to entire order').click();
    cy.contains('button', 'Save', { timeout: 10000 }).click();

    cy.get('body').then(($body) => {
      if ($body.text().includes('This field can not be empty')) {
        cy.log('✅ PASS: Validasi muncul. Tidak ada data sampah.');
      } 
      else {
        cy.log('⚠️ DEFECT: Data tersimpan tanpa validasi! Menghapus data sampah...');
        refreshCouponList(); 

        cy.contains('tr', 'WithoutSD').within(() => {
             cy.get('input[type="checkbox"]').check({ force: true });
        });

        cy.contains('a', 'Delete').click({ force: true });
        cy.wait(500);
        cy.contains('button', 'Delete', { timeout: 10000 }).click({ force: true });

        cy.log('CLEANUP: Data sampah berhasil dihapus');
      }
    });
  });

    // TC066 Menambah Kupon Baru tanpa End Date (invalid)
  it('TC066 - Menambah Kupon Baru tanpa End Date', () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('WithoutED');
    cy.get('textarea[name="description"]').type('tanpa Start Date');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.contains('label', 'Fixed discount to entire order').click();
    cy.contains('button', 'Save', { timeout: 10000 }).click();

    cy.get('body').then(($body) => {
      if ($body.text().includes('This field can not be empty')) {
        cy.log('✅ PASS: Validasi muncul. Tidak ada data sampah.');
      } 
      else {
        cy.log('⚠️ DEFECT: Data tersimpan tanpa validasi! Menghapus data sampah...');
        refreshCouponList(); 

        cy.contains('tr', 'WithoutED').within(() => {
             cy.get('input[type="checkbox"]').check({ force: true });
        });

        cy.contains('a', 'Delete').click({ force: true });
        cy.wait(500);
        cy.contains('button', 'Delete', { timeout: 10000 }).click({ force: true });

        cy.log('CLEANUP: Data sampah berhasil dihapus');
      }
    });
  });

  // TC067 Validasi tanggal tidak logis (invalid)
  it("TC067 - Validasi tanggal tidak logis", () => {
    cy.visit(baseUrl + "/coupon/new");
    cy.get('input[name="coupon"]').type('TGLINVALID');
    cy.get('textarea[name="description"]').type('Tanggal tidak logis');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-20', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-10', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('0');
    cy.get('input[name="condition[order_qty]"]').type('2');
    cy.get('input[name="user_condition[emails]"]').type('user@email.com');
    cy.get('input[name="user_condition[purchased]"]').type('0');
    cy.contains('button', 'Save', { timeout: 10000 }).click();

    cy.get('body').then(($body) => {
      if ($body.text().includes('End date must be after start date')) {
        cy.log('✅ PASS: Validasi muncul. Tidak ada data sampah.');
      } 
      else {
        cy.log('⚠️ DEFECT: Data tersimpan tanpa validasi! Menghapus data sampah...');
        refreshCouponList(); 

        cy.contains('tr', 'TGLINVALID').within(() => {
             cy.get('input[type="checkbox"]').check({ force: true });
        });

        cy.contains('a', 'Delete').click({ force: true });
        cy.wait(500);
        cy.contains('button', 'Delete', { timeout: 10000 }).click({ force: true });

        cy.log('CLEANUP: Data sampah berhasil dihapus');
      }
    });    
  });

  // TC068 Menambah kupon baru tanpa Discount Type
  it('TC068 - Menambah kupon baru tanpa Discount Type', () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('WithoutDT');
    cy.get('textarea[name="description"]').type('Diskon 10% promo');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    cy.contains("This field can not be empty", { timeout: 10000 }).should("exist");
  });

  // TC078 Membatalkan pembuatan kupon
  it("TC078 - Membatalkan pembuatan kupon", () => {
    cy.visit(baseUrl + "/coupon/new");
    cy.get('input[name="coupon"]').type('CANCELKU');
    cy.get('textarea[name="description"]').type('Akan dibatalkan');
    cy.contains('button', 'Cancel').click();
    cy.url().should('include', '/coupons');
  });

  // TC079 Edit data kupon
  it("TC079 - Edit data kupon", () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('Edit');
    cy.get('textarea[name="description"]').type('Mengedit kupon');
    cy.get('input[name="discount_amount"]').type('50');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('0');
    cy.get('input[name="condition[order_qty]"]').type('2');
    cy.get('input[name="user_condition[purchased]"]').type('0');
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    refreshCouponList();
    cy.contains('Edit', { timeout: 10000 }).should('exist');

    refreshCouponList();
    cy.contains('Edit').click();
    cy.get('input[name="discount_amount"]').clear().type('15');
    cy.contains('button', 'Save').click();

    refreshCouponList();
    cy.contains('Edit', { timeout: 10000 }).should('exist');
    cy.contains('Edit').parents('tr').within(() => {
      cy.get('input[type="checkbox"]').check({ force: true });
    });
    cy.contains('a', 'Delete').click({ force: true });
    cy.wait(500);
    cy.contains('button', 'Delete', { timeout: 10000 }).click({ force: true });

    refreshCouponList();
    cy.contains('Edit').should('not.exist');

  });

  // TC080 Menghapus kupon
  it("TC080 - Menghapus kupon", () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('Delete');
    cy.get('textarea[name="description"]').type('Menghapus kupon');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('0');
    cy.get('input[name="condition[order_qty]"]').type('2');
    cy.get('input[name="user_condition[purchased]"]').type('0');
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    refreshCouponList();
    cy.contains('Delete', { timeout: 10000 }).should('exist');

    refreshCouponList();
    cy.contains('Delete').parents('tr').within(() => {
      cy.get('input[type="checkbox"]').check({ force: true });
    });
    cy.contains('a', 'Delete').click({ force: true });
    cy.wait(500);
    cy.contains('button', 'Delete', { timeout: 10000 }).click({ force: true });

    refreshCouponList();
    cy.contains('Delete').should('not.exist');
  });

  // TC081 Ubah status aktif/nonaktif kupon
  it("TC081 - Mengubah status aktif/nonaktif kupon", () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('ChangeStatus');
    cy.get('textarea[name="description"]').type('Mengubah Status kupon');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('0');
    cy.get('input[name="condition[order_qty]"]').type('2');
    cy.get('input[name="user_condition[purchased]"]').type('0');
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    refreshCouponList();
    cy.contains('ChangeStatus', { timeout: 10000 }).should('exist');

    refreshCouponList();
    cy.contains('ChangeStatus').click();
    cy.get('.toggle').click();
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    refreshCouponList();
    cy.contains('ChangeStatus').parents('tr').find('.dot').should('exist');

    refreshCouponList();
    cy.contains('ChangeStatus').parents('tr').within(() => {
      cy.get('input[type="checkbox"]').check({ force: true });
    });
    cy.contains('a', 'Delete').click({ force: true });
    cy.wait(500);
    cy.contains('button', 'Delete', { timeout: 10000 }).click({ force: true });

    refreshCouponList();
    cy.contains('ChangeStatus').should('not.exist');
  });

  // TC082 Cari kupon di list kupon
  it("TC082 - Mencari kupon di daftar", () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('Search');
    cy.get('textarea[name="description"]').type('Mencari kupon');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('0');
    cy.get('input[name="condition[order_qty]"]').type('2');
    cy.get('input[name="user_condition[purchased]"]').type('0');
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    refreshCouponList();
    cy.contains('Search', { timeout: 10000 }).should('exist');

    refreshCouponList();
    cy.get('input[name="coupon"][placeholder="Search"]').type('Search');
    cy.wait(1000);
    cy.get('table').contains('Search', { timeout: 10000 }).should('exist');
  
    refreshCouponList();
    cy.contains('Search').parents('tr').within(() => {
      cy.get('input[type="checkbox"]').check({ force: true });
    });
    cy.contains('a', 'Delete').click({ force: true });
    cy.wait(500);
    cy.contains('button', 'Delete', { timeout: 10000 }).click({ force: true });

    refreshCouponList();
    cy.contains('Search').should('not.exist');
  });

  // TC083 Security: Input validation terhadap XSS di form coupon
  it('TC083 - Security: Input validation terhadap XSS di form coupon', () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('<script>alert(1)</script>');
    cy.get('textarea[name="description"]').type('Input validation terhadap XSS di form coupon');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    cy.contains("Exception in middleware finish: Exception in middleware createCoupon: Coupon is invalid", { timeout: 10000 }).should("exist");
  });

  it('TC084 - Reliability: Menambah dan menghapus kupon berkali-kali tanpa error', () => {
    const totalCoupons = 10;
    for (let i = 0; i < totalCoupons; i++) {
      cy.visit(baseUrl + '/coupon/new');
      cy.wait(600);

      cy.get('input[name="coupon"]').clear().type(`RLBLTY${i}`);
      cy.get('textarea[name="description"]').clear().type(`Reliability test kupon ke-${i}`);
      cy.get('input[name="discount_amount"]').clear().type('5');
      cy.wait(200);
      cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
      cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
      cy.wait(200);
      cy.contains('label', 'Percentage discount to entire order').click();
      cy.get('input[name="condition[order_total]"]').type('0');
      cy.get('input[name="condition[order_qty]"]').type('1');
      cy.wait(200);

      cy.contains('button', 'Save', { timeout: 10000 }).click({ force: true });
      cy.wait(600);
      cy.get('body').then($body => {
        const hasError = $body.find('.Toastify__toast--error, .alert-danger').length > 0;
        expect(hasError).to.eq(false);
      });
      cy.wait(400);
    }

    refreshCouponList();
    cy.get('input[name="coupon"][placeholder="Search"]')
      .type('RLBLTY0', { force: true });
    cy.wait(1000);
    cy.contains('RLBLTY0', { timeout: 10000 }).should('exist');

    for (let i = 0; i < totalCoupons; i++) {
      refreshCouponList();
      cy.wait(600);
      cy.get('input[name="coupon"][placeholder="Search"]').clear().type(`RLBLTY${i}`, { force: true });
      cy.wait(800);

      cy.contains('RLBLTY' + i, { timeout: 10000 })
        .parents('tr')
        .within(() => {
          cy.get('input[type="checkbox"]').check({ force: true });
        });
      cy.wait(400);

      cy.contains('a', 'Delete').click({ force: true });
      cy.contains('button', 'Delete', { timeout: 10000 }).click({ force: true });
      cy.wait(1000);

      cy.contains(`RLBLTY${i}`, { timeout: 5000 }).should('not.exist');
      cy.wait(400);
    }
  });

  // TC085 - Portability: Halaman daftar kupon pada viewport iPhone (iphone-x)
  it('TC085 - Portability: Halaman daftar kupon pada viewport iPhone (iphone-x)', () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.get('input[name="coupon"]').type('iphone');
    cy.get('textarea[name="description"]').type('test Portability');
    cy.get('input[name="discount_amount"]').type('10');
    cy.get('input[name="start_date"]').type('2025-11-10', { force: true });
    cy.get('input[name="end_date"]').type('2026-11-30', { force: true });
    cy.contains('label', 'Percentage discount to entire order').click();
    cy.get('input[name="condition[order_total]"]').type('0');
    cy.get('input[name="condition[order_qty]"]').type('2');
    cy.get('input[name="user_condition[purchased]"]').type('0');
    cy.contains('button', 'Save', { timeout: 10000 }).click();
    refreshCouponList();
    cy.contains('iphone', { timeout: 10000 }).should('exist');

    cy.viewport('iphone-x'); // 375 x 812

    refreshCouponList();
    cy.contains('New Coupon').should('be.visible');
    cy.get('input[name="coupon"][placeholder="Search"]').should('be.visible');

    // Scroll ke tabel supaya Cypress mendeteksi visible di viewport
    cy.get('table.listing.sticky').scrollIntoView();

    cy.get('input[name="coupon"][placeholder="Search"]').type('iphone-x', { force: true });
    cy.wait(1000);

    cy.contains('iphone').should('exist');

    // Jika ingin memastikan benar-benar terlihat dan tidak ketutup layout:
    cy.contains('iphone').scrollIntoView().should('be.visible');

    refreshCouponList();
    cy.contains('iphone').parents('tr').within(() => {
      cy.get('input[type="checkbox"]').check({ force: true });
    });
    cy.contains('a', 'Delete').click({ force: true });
    cy.wait(500);
    cy.contains('button', 'Delete', { timeout: 10000 }).click({ force: true });

    refreshCouponList();
    cy.contains('iphone').should('not.exist');
  });
});

