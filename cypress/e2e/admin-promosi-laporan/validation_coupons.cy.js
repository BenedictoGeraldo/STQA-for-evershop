/// <reference types="cypress" />
const baseUrl = "http://localhost:3000/admin";
const loginEmail = "admin@email.com";
const loginPass = "123123123";

it("TC069 - Menambah kupon tanpa mengisi Minimum purchase amount dan validasi kupon", () => {
  cy.visit(baseUrl + "/login");
  cy.get('input[name="email"]').type(loginEmail);
  cy.get('input[name="password"]').type(loginPass);
  cy.get('button[type="submit"]').click();
  cy.wait(500);
  cy.url().should('include', "/admin");

  cy.visit(baseUrl + "/coupon/new");
  cy.get('input[name="coupon"]').type('MIN0');
  cy.get('textarea[name="description"]').type('Without Minimum');
  cy.get('input[name="discount_amount"]').type('20');
  cy.get('input[name="start_date"]').type('2025-11-21', { force: true });
  cy.get('input[name="end_date"]').type('2025-11-30', { force: true });
  cy.contains('label', 'Fixed discount to entire order').click();
  cy.wait(500);

  cy.contains('button', 'Save', { timeout: 10000 }).click();

  cy.wait(1000);
  cy.visit(baseUrl + '/coupons');
  cy.reload();
  cy.wait(500);
  cy.contains('MIN0', { timeout: 10000 }).should('exist');

  cy.clearCookies();
  cy.wait(500);
  cy.visit('http://localhost:3000/account/login');
  cy.get('input[name="email"]').clear().type('user@email.com');
  cy.get('input[name="password"]').type('123123123');
  cy.get('button[type="submit"]').contains('SIGN IN').click();
  cy.wait(800);

  cy.visit('http://localhost:3000/men');
  cy.wait(500);
  cy.contains('.listing-tem .product-name a', 'Air Max Runner Men').click();
  cy.wait(500);

  cy.contains('button', 'ADD TO CART').click();
  cy.wait(1000);

  cy.get('.Toastify__toast-container', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.get('a.add-cart-popup-button').contains('VIEW CART').click();
    });
  cy.wait(1000);

  cy.get('input[name="coupon"]').clear().type('MIN0');
  cy.contains('button', 'Apply').click();
  cy.wait(1000);

  cy.contains('.summary', 'Discount(MIN0)').parent().within(() => {
    cy.get('.text-right').invoke('text').then((discountText) => {
      expect(discountText.trim()).not.to.eq('$0.00');
    });
  });
  cy.get('#shopping-cart-items a').contains('Remove').click();
  cy.wait(500);
});

it("TC070 - Menambah kupon dengan mengisi Minimum purchase amount 100 $ dan validasi kupon", () => {
  cy.visit(baseUrl + "/login");
  cy.get('input[name="email"]').type(loginEmail);
  cy.get('input[name="password"]').type(loginPass);
  cy.get('button[type="submit"]').click();
  cy.wait(500);
  cy.url().should('include', "/admin");

  cy.visit(baseUrl + "/coupon/new");
  cy.get('input[name="coupon"]').type('MIN100');
  cy.get('textarea[name="description"]').type('Minimal 100 $');
  cy.get('input[name="discount_amount"]').type('20');
  cy.get('input[name="start_date"]').type('2025-11-21', { force: true });
  cy.get('input[name="end_date"]').type('2025-11-30', { force: true });
  cy.contains('label', 'Fixed discount to entire order').click();
  cy.get('input[name="condition[order_total]"]').type('100');
  cy.wait(500);

  cy.contains('button', 'Save', { timeout: 10000 }).click();

  cy.wait(1000);
  cy.visit(baseUrl + '/coupons');
  cy.reload();
  cy.wait(500);
  cy.contains('MIN0', { timeout: 10000 }).should('exist');

  cy.clearCookies();
  cy.wait(500);
  cy.visit('http://localhost:3000/account/login');
  cy.get('input[name="email"]').clear().type('user@email.com');
  cy.get('input[name="password"]').type('123123123');
  cy.get('button[type="submit"]').contains('SIGN IN').click();
  cy.wait(800);

  cy.visit('http://localhost:3000/men');
  cy.wait(500);
  cy.contains('.listing-tem .product-name a', 'Urban Denim Jacket').click();
  cy.wait(500);

  cy.contains('button', 'ADD TO CART').click();
  cy.wait(1000);

  cy.get('.Toastify__toast-container', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.get('a.add-cart-popup-button').contains('VIEW CART').click();
    });
  cy.wait(1000);

  cy.get('input[name="coupon"]').clear().type('MIN100');
  cy.contains('button', 'Apply').click();
  cy.wait(1000);
  cy.contains('.Toastify__toast-body', 'Invalid coupon', { timeout: 10000 })
    .should('be.visible');
  cy.get('#shopping-cart-items a').contains('Remove').click();
  cy.wait(500);
});

it("TC071 - Menambah kupon dengan mengisi Minimum purchase qty sebanyak 2 dan validasi kupon", () => {
  cy.visit(baseUrl + "/login");
  cy.get('input[name="email"]').type(loginEmail);
  cy.get('input[name="password"]').type(loginPass);
  cy.get('button[type="submit"]').click();
  cy.wait(500);
  cy.url().should('include', "/admin");

  cy.visit(baseUrl + "/coupon/new");
  cy.get('input[name="coupon"]').type('2QTY');
  cy.get('textarea[name="description"]').type('2 QTY Valid');
  cy.get('input[name="discount_amount"]').type('20');
  cy.get('input[name="start_date"]').type('2025-11-21', { force: true });
  cy.get('input[name="end_date"]').type('2025-11-30', { force: true });
  cy.contains('label', 'Fixed discount to entire order').click();
  cy.get('input[name="condition[order_qty]"]').type('2');
  cy.wait(500);

  cy.contains('button', 'Save', { timeout: 10000 }).click();

  cy.wait(1000);
  cy.visit(baseUrl + '/coupons');
  cy.reload();
  cy.wait(500);
  cy.contains('2QTY', { timeout: 10000 }).should('exist');

  cy.clearCookies();
  cy.wait(500);
  cy.visit('http://localhost:3000/account/login');
  cy.get('input[name="email"]').clear().type('user@email.com');
  cy.get('input[name="password"]').type('123123123');
  cy.get('button[type="submit"]').contains('SIGN IN').click();
  cy.wait(800);

  cy.visit('http://localhost:3000/men');
  cy.wait(500);
  cy.contains('.listing-tem .product-name a', 'Air Max Runner Men').click();
  cy.wait(500);
  cy.get('input[name="qty"]').clear().type('2');
  cy.wait(500);
  cy.contains('button', 'ADD TO CART').click();
  cy.wait(1000);

  cy.get('.Toastify__toast-container', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.get('a.add-cart-popup-button').contains('VIEW CART').click();
    });
  cy.wait(1000);

  cy.get('input[name="coupon"]').clear().type('2QTY');
  cy.contains('button', 'Apply').click();
  cy.wait(1000);

  cy.contains('.summary', 'Discount(2QTY)').parent().within(() => {
    cy.get('.text-right').invoke('text').then((discountText) => {
      expect(discountText.trim()).not.to.eq('$0.00');
    });
  });
  cy.get('#shopping-cart-items a').contains('Remove').click();
  cy.wait(500);
});

it("TC072 - Menambah kupon dengan mengisi Minimum purchase qty sebanyak 3 dan validasi kupon", () => {
  cy.visit(baseUrl + "/login");
  cy.get('input[name="email"]').type(loginEmail);
  cy.get('input[name="password"]').type(loginPass);
  cy.get('button[type="submit"]').click();
  cy.wait(500);
  cy.url().should('include', "/admin");

  cy.visit(baseUrl + "/coupon/new");
  cy.get('input[name="coupon"]').type('3QTY');
  cy.get('textarea[name="description"]').type('3 QTY Invalid');
  cy.get('input[name="discount_amount"]').type('20');
  cy.get('input[name="start_date"]').type('2025-11-21', { force: true });
  cy.get('input[name="end_date"]').type('2025-11-30', { force: true });
  cy.contains('label', 'Fixed discount to entire order').click();
  cy.get('input[name="condition[order_qty]"]').type('3');
  cy.wait(500);

  cy.contains('button', 'Save', { timeout: 10000 }).click();

  cy.wait(1000);
  cy.visit(baseUrl + '/coupons');
  cy.reload();
  cy.wait(500);
  cy.contains('3QTY', { timeout: 10000 }).should('exist');

  cy.clearCookies();
  cy.wait(500);
  cy.visit('http://localhost:3000/account/login');
  cy.get('input[name="email"]').clear().type('user@email.com');
  cy.get('input[name="password"]').type('123123123');
  cy.get('button[type="submit"]').contains('SIGN IN').click();
  cy.wait(800);

  cy.visit('http://localhost:3000/men');
  cy.wait(500);
  cy.contains('.listing-tem .product-name a', 'Air Max Runner Men').click();
  cy.wait(500);
  cy.contains('button', 'ADD TO CART').click();
  cy.wait(1000);

  cy.get('.Toastify__toast-container', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.get('a.add-cart-popup-button').contains('VIEW CART').click();
    });
  cy.wait(1000);

  cy.get('input[name="coupon"]').clear().type('3QTY');
  cy.contains('button', 'Apply').click();
  cy.wait(1000);
  cy.contains('.Toastify__toast-body', 'Invalid coupon', { timeout: 10000 })
    .should('be.visible');
  cy.get('#shopping-cart-items a').contains('Remove').click();
  cy.wait(500);
});

it("TC073 - Menambah kupon dengan tipe Fixed discount to specific products lalu digunakan user", () => {
  cy.visit(baseUrl + "/login");
  cy.get('input[name="email"]').type(loginEmail);
  cy.get('input[name="password"]').type(loginPass);
  cy.get('button[type="submit"]').click();
  cy.wait(500);
  cy.url().should('include', "/admin");

  cy.visit(baseUrl + "/coupon/new");
  cy.get('input[name="coupon"]').type('PERSEN20');
  cy.get('textarea[name="description"]').type('Diskon 20 persen');
  cy.get('input[name="discount_amount"]').type('20');
  cy.get('input[name="start_date"]').type('2025-11-21', { force: true });
  cy.get('input[name="end_date"]').type('2025-11-30', { force: true });
  cy.contains('label', 'Fixed discount to specific products').click();

  cy.get('.pl-4').contains('Add product').click();
  cy.get('select[name="target_products[products][0][key]"]').select('category');
  cy.get('select[name="target_products[products][0][operator]"]').select('IN');
  cy.contains('a', 'Choose categories').click();

  cy.get('.modal').within(() => {
    cy.contains('.col-span-5 span', 'Men')
      .parents('.grid-cols-8')
      .find('button.button.secondary')
      .contains('Select')
      .click();
    cy.get('button.button.secondary').contains('Close').click();
  });
  cy.get('.modal').should('not.exist');
  cy.wait(500);
  cy.get('input[name="target_products[maxQty]"]').clear().type('2');
  cy.contains('button', 'Save', { timeout: 10000 }).click();

  cy.wait(1000);
  cy.visit(baseUrl + '/coupons');
  cy.reload();
  cy.wait(500);
  cy.contains('PERSEN20', { timeout: 10000 }).should('exist');

  cy.clearCookies();
  cy.wait(500);
  cy.visit('http://localhost:3000/account/login');
  cy.get('input[name="email"]').clear().type('user@email.com');
  cy.get('input[name="password"]').type('123123123');
  cy.get('button[type="submit"]').contains('SIGN IN').click();
  cy.wait(800);

  cy.visit('http://localhost:3000/men');
  cy.wait(500);
  cy.contains('.listing-tem .product-name a', 'Air Max Runner Men').click();
  cy.wait(500);

  cy.contains('button', 'ADD TO CART').click();
  cy.wait(1000);

  cy.get('.Toastify__toast-container', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.get('a.add-cart-popup-button').contains('VIEW CART').click();
    });
  cy.wait(1000);

  cy.get('input[name="coupon"]').clear().type('PERSEN20');
  cy.contains('button', 'Apply').click();
  cy.wait(1000);

  cy.contains('.summary', 'Discount(PERSEN20)').parent().within(() => {
    cy.get('.text-right').invoke('text').then((discountText) => {
      expect(discountText.trim()).not.to.eq('$0.00');
    });
  });
  cy.get('#shopping-cart-items a').contains('Remove').click();
  cy.wait(500);
});

it("TC074 - Kupon fixed spesifik produk tidak berlaku di kategori selain Men", () => {
  cy.visit('http://localhost:3000/account/login');
  cy.get('input[name="email"]').clear().type('user@email.com');
  cy.get('input[name="password"]').type('123123123');
  cy.get('button[type="submit"]').contains('SIGN IN').click();
  cy.wait(800);

  cy.visit('http://localhost:3000/kids');
  cy.wait(500);
  cy.contains('.listing-tem .product-name a', 'Kids Star Tee').click();
  cy.wait(500);

  cy.contains('button', 'ADD TO CART').click();
  cy.wait(1000);

  cy.get('.Toastify__toast-container', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.get('a.add-cart-popup-button').contains('VIEW CART').click();
    });
  cy.wait(1000);

  cy.get('input[name="coupon"]').clear().type('PERSEN20');
  cy.contains('button', 'Apply').click();
  cy.wait(1000);

  cy.contains('.summary', 'Discount(PERSEN20)').parent().within(() => {
    cy.get('.text-right').should('contain', '$0.00');
  });
  cy.get('#shopping-cart-items a').contains('Remove').click();
  cy.wait(500);
});

it("TC075 - Menambah kupon untuk user tertentu dan validasi kupon (Valid)", () => {
  cy.visit(baseUrl + "/login");
  cy.get('input[name="email"]').type(loginEmail);
  cy.get('input[name="password"]').type(loginPass);
  cy.get('button[type="submit"]').click();
  cy.wait(500);
  cy.url().should('include', "/admin");

  cy.visit(baseUrl + "/coupon/new");
  cy.get('input[name="coupon"]').type('USERONLY');
  cy.get('textarea[name="description"]').type('Khusus user tertentu');
  cy.get('input[name="discount_amount"]').type('20');
  cy.get('input[name="start_date"]').type('2025-11-21', { force: true });
  cy.get('input[name="end_date"]').type('2025-11-30', { force: true });
  cy.contains('label', 'Fixed discount to entire order').click();
  cy.get('input[name="user_condition[emails]"]').type('user@email.com');
  cy.wait(500);

  cy.contains('button', 'Save', { timeout: 10000 }).click();

  cy.wait(1000);
  cy.visit(baseUrl + '/coupons');
  cy.reload();
  cy.wait(500);
  cy.contains('USERONLY', { timeout: 10000 }).should('exist');

  cy.clearCookies();
  cy.wait(500);
  cy.visit('http://localhost:3000/account/login');
  cy.get('input[name="email"]').clear().type('user@email.com');
  cy.get('input[name="password"]').type('123123123');
  cy.get('button[type="submit"]').contains('SIGN IN').click();
  cy.wait(800);

  cy.visit('http://localhost:3000/men');
  cy.wait(500);
  cy.contains('.listing-tem .product-name a', 'Air Max Runner Men').click();
  cy.wait(500);

  cy.contains('button', 'ADD TO CART').click();
  cy.wait(1000);

  cy.get('.Toastify__toast-container', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.get('a.add-cart-popup-button').contains('VIEW CART').click();
    });
  cy.wait(1000);

  cy.get('input[name="coupon"]').clear().type('USERONLY');
  cy.contains('button', 'Apply').click();
  cy.wait(1000);

  cy.contains('.summary', 'Discount(USERONLY)').parent().within(() => {
    cy.get('.text-right').invoke('text').then((discountText) => {
      expect(discountText.trim()).not.to.eq('$0.00');
    });
  });
  cy.get('#shopping-cart-items a').contains('Remove').click();
  cy.wait(500);
  cy.visit('http://localhost:3000/account');
  cy.contains('a', 'Logout').click();
  cy.url().should('not.include', '/account');
});

it("TC076 - Menambah kupon untuk user tertentu dan validasi kupon (Invalid)", () => {
  cy.visit('http://localhost:3000/account/login');
  cy.get('input[name="email"]').clear().type('user2@email.com');
  cy.get('input[name="password"]').type('123123123');
  cy.get('button[type="submit"]').contains('SIGN IN').click();
  cy.wait(800);

  cy.visit('http://localhost:3000/men');
  cy.wait(500);
  cy.contains('.listing-tem .product-name a', 'Air Max Runner Men').click();
  cy.wait(500);

  cy.contains('button', 'ADD TO CART').click();
  cy.wait(1000);

  cy.get('.Toastify__toast-container', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.get('a.add-cart-popup-button').contains('VIEW CART').click();
    });
  cy.wait(1000);

  cy.get('input[name="coupon"]').clear().type('USERONLY');
  cy.contains('button', 'Apply').click();
  cy.wait(1000);
  cy.contains('.Toastify__toast-body', 'Invalid coupon', { timeout: 10000 })
    .should('be.visible');
  cy.get('#shopping-cart-items a').contains('Remove').click();
  cy.wait(500);
  cy.visit('http://localhost:3000/account');
  cy.contains('a', 'Logout').click();
  cy.url().should('not.include', '/account');
});

it("TC077 - Menambah kupon tanpa user tertentu dan validasi kupon", () => {
  cy.visit(baseUrl + "/login");
  cy.get('input[name="email"]').type(loginEmail);
  cy.get('input[name="password"]').type(loginPass);
  cy.get('button[type="submit"]').click();
  cy.wait(500);
  cy.url().should('include', "/admin");

  cy.visit(baseUrl + "/coupon/new");
  cy.get('input[name="coupon"]').type('ONE4ALL');
  cy.get('textarea[name="description"]').type('Tanpa User tertentu');
  cy.get('input[name="discount_amount"]').type('20');
  cy.get('input[name="start_date"]').type('2025-11-21', { force: true });
  cy.get('input[name="end_date"]').type('2025-11-30', { force: true });
  cy.contains('label', 'Fixed discount to entire order').click();
  cy.wait(500);

  cy.contains('button', 'Save', { timeout: 10000 }).click();

  cy.wait(1000);
  cy.visit(baseUrl + '/coupons');
  cy.reload();
  cy.wait(500);
  cy.contains('ONE4ALL', { timeout: 10000 }).should('exist');

  cy.clearCookies();
  cy.wait(500);
  cy.visit('http://localhost:3000/account/login');
  cy.get('input[name="email"]').clear().type('user@email.com');
  cy.get('input[name="password"]').type('123123123');
  cy.get('button[type="submit"]').contains('SIGN IN').click();
  cy.wait(800);

  cy.visit('http://localhost:3000/men');
  cy.wait(500);
  cy.contains('.listing-tem .product-name a', 'Air Max Runner Men').click();
  cy.wait(500);

  cy.contains('button', 'ADD TO CART').click();
  cy.wait(1000);

  cy.get('.Toastify__toast-container', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.get('a.add-cart-popup-button').contains('VIEW CART').click();
    });
  cy.wait(1000);

  cy.get('input[name="coupon"]').clear().type('ONE4ALL');
  cy.contains('button', 'Apply').click();
  cy.wait(1000);

  cy.contains('.summary', 'Discount(ONE4ALL)').parent().within(() => {
    cy.get('.text-right').invoke('text').then((discountText) => {
      expect(discountText.trim()).not.to.eq('$0.00');
    });
  });
  cy.get('#shopping-cart-items a').contains('Remove').click();
  cy.wait(500);
  cy.visit('http://localhost:3000/account');
  cy.contains('a', 'Logout').click();
  cy.url().should('not.include', '/account');

    cy.visit('http://localhost:3000/account/login');
  cy.get('input[name="email"]').clear().type('user2@email.com');
  cy.get('input[name="password"]').type('123123123');
  cy.get('button[type="submit"]').contains('SIGN IN').click();
  cy.wait(800);

  cy.visit('http://localhost:3000/men');
  cy.wait(500);
  cy.contains('.listing-tem .product-name a', 'Air Max Runner Men').click();
  cy.wait(500);

  cy.contains('button', 'ADD TO CART').click();
  cy.wait(1000);

  cy.get('.Toastify__toast-container', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.get('a.add-cart-popup-button').contains('VIEW CART').click();
    });
  cy.wait(1000);

  cy.get('input[name="coupon"]').clear().type('ONE4ALL');
  cy.contains('button', 'Apply').click();
  cy.wait(1000);
  cy.contains('.summary', 'Discount(ONE4ALL)').parent().within(() => {
    cy.get('.text-right').invoke('text').then((discountText) => {
      expect(discountText.trim()).not.to.eq('$0.00');
    });
  });
  cy.get('#shopping-cart-items a').contains('Remove').click();
  cy.wait(500);
  cy.visit('http://localhost:3000/account');
  cy.contains('a', 'Logout').click();
  cy.url().should('not.include', '/account');
});