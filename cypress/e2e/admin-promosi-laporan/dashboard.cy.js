/// <reference types="cypress" />

const baseUrl = "http://localhost:3000/admin";
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

  // TC030 - Halaman dashboard tampil
  it("TC030 - Dashboard tampil", () => {
    refreshDashboard();
    cy.get('.page-heading-title').contains("Dashboard").should("exist");
    cy.get('.card-title').contains("Sale Statistics").should("exist");
    cy.get('.card-title').contains("Lifetime Sales").should("exist");
    cy.get('.card-title').contains("Best Sellers").should("exist");
  });

  // TC031 - Summary & grafik sesuai order kosong/ada
  it("TC031 - Dashboard: order dan sales", () => {
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

  // TC032 - Dashboard vs Order List: jumlah order cross-check
  it("TC032 - Jumlah order di dashboard = order list", () => {
    cy.visit(baseUrl + '/orders');
    cy.get('table.listing.sticky > tbody > tr').then((trs) => {
      const orderCount = trs.length - 1; // exclude header or dummy tr
      cy.visit(baseUrl);
      cy.get('.card-title').contains("Lifetime Sales").parents('.card').within(() => {
        cy.get('.self-center').contains(`${orderCount} orders`).should('exist');
      });
    });
  });

  // TC033 - Best seller: produk terlaris tampil
  it("TC033 - Produk best seller tampil urut", () => {
    refreshDashboard();
    cy.get('.card-title').contains("Best Sellers").parents('.card').within(() => {
      cy.get('table.bestsellers tbody tr').first().find('a.font-semibold').should('exist');
      cy.get('table.bestsellers tbody tr').its('length').should('be.gte', 1);
      cy.get('table.bestsellers tbody tr').each(($tr) => {
        cy.wrap($tr).find('td').last().invoke('text').should('contain', 'sold');
      });
    });
  });

  // TC034 - Grafik dashboard berada di area chart dan ada label tanggal
  it("TC034 - Grafik ada label tanggal", () => {
    refreshDashboard();
    cy.get('.card-title').contains("Sale Statistics").parents('.card').within(() => {
      cy.get('svg.recharts-surface').should('exist');
      cy.get('.recharts-cartesian-axis-tick-value').should('exist');
    });
  });

  // TC035 - Validasi tampilan “Best Sellers”
  it("TC035 - Validasi tampilan 'Best Sellers' di dashboard", () => {
    refreshDashboard();

    // Ambil seluruh baris produk di tabel best sellers
    cy.get('.card-title').contains("Best Sellers").parents('.card').within(() => {
      // Dapatkan semua baris produk best seller
      cy.get('table.bestsellers tbody tr').then($rows => {
        // Pastikan ada minimal 1 baris
        expect($rows.length).to.be.gte(1);

        // Ambil jumlah sold setiap produk pada setiap baris
        const soldList = [];
        cy.wrap($rows).each(($row, idx) => {
          // Jumlah sold ada di <td> terakhir misal "4 sold"
          cy.wrap($row).find('td').last().invoke('text').then(text => {
            // Ambil angka dari teks "X sold"
            const sold = parseInt(text.replace(/[^0-9]/g, ''), 10);
            soldList.push(sold);

            // Jika sudah di baris terakhir, validasi urutan
            if (idx === $rows.length - 1) {
              const sorted = [...soldList].sort((a, b) => b - a); // Urutan desc
              expect(soldList).to.deep.equal(sorted); // Pastikan urut dari terbanyak ke sedikit
            }
          });
        });

        // Validasi produk terlaris di posisi pertama (custom nama, misal Urban Denim Jacket)
        cy.wrap($rows[0]).find('a.font-semibold').invoke('text').should('eq', 'Urban Denim Jacket');
        cy.wrap($rows[0]).find('td').last().invoke('text').should('contain', '4 sold');
      });
    });
  });

  // TC036 - Filter periodik dashboard chart aktif (daily/weekly/monthly)
  it("TC036 - Filter grafik sales periodik berjalan", () => {
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

  // TC037 - Dashboard harus tampil < 3 detik
  it("TC037 - Performa load dashboard < 2 detik", () => {
    const start = Date.now();
    cy.visit(baseUrl);
    cy.get('.page-heading-title').contains("Dashboard").should("exist").then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(2000);
    });
  });
});
