/// <reference types="cypress" />

const baseUrl = "http://localhost:3002/admin";
const loginEmail = "admin@email.com";
const loginPass = "123123123";

// Helper login
function adminLogin() {
  cy.visit(baseUrl + "/login");
  cy.get('input[name="email"]').type(loginEmail);
  cy.get('input[name="password"]').type(loginPass);
  cy.get('button[type="submit"]').click();
  cy.wait(1000);
  cy.url().should('include', "/admin");
}

// Helper reload dashboard
function refreshDashboard() {
  cy.visit(baseUrl);
  cy.reload();
  cy.wait(1000);
}

describe("Dashboard Module E2E", () => {

  beforeEach(() => {
    adminLogin();
  });

  // TC018 - Halaman dashboard tampil
  it("TC018 - Dashboard tampil", () => {
    refreshDashboard();
    cy.get('.page-heading-title').contains("Dashboard").should("exist");
    cy.get('.card-title').contains("Sale Statistics").should("exist");
    cy.get('.card-title').contains("Lifetime Sales").should("exist");
    cy.get('.card-title').contains("Best Sellers").should("exist");
  });

  // TC019 - Summary & grafik sesuai order kosong/ada
  it("TC019 - Dashboard: order dan sales", () => {
    refreshDashboard();
    cy.get('.card-title').contains("Lifetime Sales").parents('.card').within(() => {
      cy.get('.self-center').contains('orders').should('exist');
      cy.get('.self-center').contains('lifetime sale').should('exist');
    });
    cy.get('.card-title').contains("Sale Statistics")
      .parents('.card')
      .find('svg.recharts-surface')
      .should('exist');
  });

  // TC020 - Dashboard vs Order List: jumlah order cross-check
  it("TC020 - Jumlah order di dashboard = order list", () => {
    cy.visit(baseUrl + '/orders');
    cy.get('table.listing.sticky > tbody > tr').then((trs) => {
      const orderCount = trs.length - 1; // exclude header or dummy tr
      cy.visit(baseUrl);
      cy.get('.card-title').contains("Lifetime Sales").parents('.card').within(() => {
        cy.get('.self-center').contains(`${orderCount} orders`).should('exist');
      });
    });
  });

  // TC022 - Best seller: produk terlaris tampil
  it("TC022 - Produk best seller tampil urut", () => {
    refreshDashboard();
    cy.get('.card-title').contains("Best Sellers").parents('.card').within(() => {
      cy.get('table.bestsellers tbody tr').first().find('a.font-semibold').should('exist');
      cy.get('table.bestsellers tbody tr').its('length').should('be.gte', 1);
      cy.get('table.bestsellers tbody tr').each(($tr) => {
        cy.wrap($tr).find('td').last().invoke('text').should('contain', 'sold');
      });
    });
  });

  // TC023 - Grafik dashboard berada di area chart dan ada label tanggal
  it("TC023 - Grafik ada label tanggal", () => {
    refreshDashboard();
    cy.get('.card-title').contains("Sale Statistics").parents('.card').within(() => {
      cy.get('svg.recharts-surface').should('exist');
      cy.get('.recharts-cartesian-axis-tick-value').should('exist');
    });
  });

  // TC024 - Statistik order di pie chart tampil
  it("TC024 - Statistik order pie chart tampil", () => {
    refreshDashboard();
    cy.get('.card-title').contains("Lifetime Sales").parents('.card').within(() => {
      cy.get('svg.recharts-surface').should('exist');
      cy.get('.recharts-pie-label-text').should('exist');
    });
  });

  // TC026 - Setelah reload, dashboard tetap tampil konsisten
  it("TC026 - Reload dashboard tetap muncul", () => {
    cy.visit(baseUrl);
    cy.reload();
    cy.get('.card-title').contains('Sale Statistics').should('exist');
    cy.get('.card-title').contains('Best Sellers').should('exist');
    cy.get('.card-title').contains('Lifetime Sales').should('exist');
  });

  // TC027 - Filter periodik dashboard chart aktif (daily/weekly/monthly)
  it("TC027 - Filter grafik sales periodik berjalan", () => {
    refreshDashboard();
    cy.get('.card-title').contains("Sale Statistics").parents('.card').within(() => {
      cy.contains('a.text-interactive', 'Daily').click();
      cy.get('svg.recharts-surface').should('exist');
      cy.contains('a.text-interactive', 'Weekly').click();
      cy.get('svg.recharts-surface').should('exist');
      cy.contains('a.text-interactive', 'Monthly').click();
      cy.get('svg.recharts-surface').should('exist');
    });
  });

  // TC028 - Dashboard harus tampil < 3 detik
  it("TC028 - Performa load dashboard < 3 detik", () => {
    const start = Date.now();
    cy.visit(baseUrl);
    cy.get('.page-heading-title').contains("Dashboard").should("exist").then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(3000);
    });
  });

});
