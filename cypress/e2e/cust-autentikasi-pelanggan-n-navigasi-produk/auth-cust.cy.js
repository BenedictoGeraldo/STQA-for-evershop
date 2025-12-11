// cypress/e2e/cust-authentication.cy.js

/**
 * ======================================================================
 * GRUP 1: Tes yang dimulai dari Halaman Login (Kondisi Logged-Out)
 * ======================================================================
 * Meliputi: TC-001 dan  TC-006/TC-010
 */


describe("Full E2E Authentication Flow – Evershop", () => {
  const loginUrl = "http://localhost:3000/account/login";
  const registerUrl = "http://localhost:3000/account/register";
  const resetUrl = "http://localhost:3000/account/reset-password";
  const homeUrl = "http://localhost:3000/";

  // ---------------------------- //
  // LOGIN TEST CASES
  // ---------------------------- //
  beforeEach(() => {
    cy.visit(loginUrl);
  });

  // TC-001 – Akun belum terdaftar
  it("TC-176 | Login gagal (akun belum terdaftar)", () => {
    cy.get('input[name="email"]').type("ivan@email.com");
    cy.get('input[name="password"]').type("ivan123456");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email or password").should("be.visible");
  });

  // TC-002 – Link Create an Account
  it("TC-177 | Klik link Create an account", () => {
    cy.contains("Create an account").click();
    cy.url().should("include", "/account/register");
  });

  // TC-003 – Full Name kosong
  it("TC-178 | Validasi Full Name kosong", () => {
    cy.visit(registerUrl);

    cy.get('input[name="email"]').type("user@email.com");
    cy.get('input[name="password"]').type("123123123");
    cy.get('button[type="submit"]').click();

    cy.contains("This field can not be empty").should("be.visible");
  });

  // TC-179 – Password kosong (Register)
  it("TC-179 | Validasi Password kosong (Register)", () => {
    cy.visit(registerUrl);

    cy.get('input[name="full_name"]').type("Testing User");
    cy.get('input[name="email"]').type("user@email.com");
    cy.get('button[type="submit"]').click();

    cy.contains("This field can not be empty").should("be.visible");
  });

  // TC-180 – Email format salah (Register)
  it("TC-180 | Validasi email salah format (Register)", () => {
    cy.visit(registerUrl);

    cy.get('input[name="full_name"]').type("New Tester");
    cy.get('input[name="email"]').type("email.tanpa@domain");
    cy.get('input[name="password"]').type("123123123");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email").should("be.visible");
  });

  // TC-181 – Register sukses
  it("TC-181 | Register sukses", () => {
    cy.visit(registerUrl);
    cy.get('input[name="full_name"]').type("User Baru");
    cy.get('input[name="email"]').type("user@email.com");
    cy.get('input[name="password"]').type("123123123");
    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/account");
  });

  // TC-182 – Login sukses
  it("TC-182 | Login sukses", () => {
    cy.get('input[name="email"]').type("user@email.com");
    cy.get('input[name="password"]').type("123123123");
    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/account");
  });

  // TC-008 – Password salah
  it("TC-183 | Login gagal - password salah", () => {
    cy.get('input[name="email"]').type("user@email.com");
    cy.get('input[name="password"]').type("PasswordSalah456");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email or password").should("be.visible");
  });

  // TC-009 – Email tidak terdaftar
  it("TC-184 | Login gagal - email tidak terdaftar", () => {
    cy.get('input[name="email"]').type("belumterdaftar@test.com");
    cy.get('input[name="password"]').type("123123123");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email or password").should("be.visible");
  });

  // TC-010 – Email kosong
  it("TC-185 | Validasi email kosong (Login)", () => {
    cy.get('input[name="password"]').type("123123123");
    cy.get('button[type="submit"]').click();

    cy.contains("This field can not be empty").should("be.visible");
  });

  // TC-011 – Password kosong
  it("TC-186 | Validasi password kosong (Login)", () => {
    cy.get('input[name="email"]').type("user@email.com");
    cy.get('button[type="submit"]').click();

    cy.contains("This field can not be empty").should("be.visible");
  });

  // TC-012 – Format email salah
  it("TC-187 | Validasi format email salah (Login)", () => {
    cy.get('input[name="email"]').type("emailtanpaat.com");
    cy.get('input[name="password"]').type("123123123");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email").should("be.visible");
  });

  // TC-013 – Forgot your password link
  it("TC-188 | Klik Forgot your password?", () => {
    cy.contains("Forgot your password?").click();
    cy.url().should("include", "/account/reset-password");
  });

  // TC-014 – Reset password sukses
  it("TC-189 | Reset password sukses", () => {
    cy.visit(resetUrl);

    cy.get('input[name="email"]').type("user@email.com");
    cy.get('button[type="submit"]').click();

    cy.contains("We have sent you an email with a link to reset your password. Please check your inbox.").should("be.visible");
  });

  // TC-015 – Email salah format (reset password)
  it("TC-190 | Validasi format email salah (Reset Password)", () => {
    cy.visit(resetUrl);

    cy.get('input[name="email"]').type("format-salah");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email").should("be.visible");
  });

  it("TC-191 | Email kosong saat reset password", () => {
    cy.visit(resetUrl);

    cy.get('button[type="submit"]').click();

    cy.contains("This field can not be empty").should("be.visible");
  });

  it("TC-192 | Format email tidak valid saat reset password", () => {
    cy.visit(resetUrl);

    cy.get('input[name="email"]').type("emailsalahformat");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email")
      .should("be.visible");
  });

  it("TC-193 | Password terlalu pendek", () => {
    cy.visit(registerUrl);

    const randomEmail = `test${Date.now()}@example.com`;

    cy.get('input[name="full_name"]').type("User Test");
    cy.get('input[name="email"]').type("user@email.com");
    cy.get('input[name="password"]').type("123"); // kurang dari 8 karakter

    cy.get('button[type="submit"]').click();

    // Expected: Tidak ada error, register berhasil
    cy.url().should("include", "/account");
  });

  it("TC-194 | Full name melebihi batas 100 karakter", () => {
    cy.visit(registerUrl);

    const longName = "A".repeat(999); // 150 karakter


    cy.get('input[name="full_name"]').type(longName);
    cy.get('input[name="email"]').type("user@email.com");
    cy.get('input[name="password"]').type("password123");

    cy.get('button[type="submit"]').click();

    // Karena app tidak menolak full name panjang, maka expected-nya: register berhasil
    cy.url().should("include", "/account");
  });

  it("TC-195 | Placeholder muncul dengan benar", () => {
    cy.visit(registerUrl);

    cy.visit("/account/register");

    cy.get('input[name="full_name"]')
      .should("have.attr", "placeholder", "Full Name");
    cy.get('input[name="email"]')
      .should("have.attr", "placeholder", "Email");
    cy.get('input[name="password"]')
      .should("have.attr", "placeholder", "Password");
  });

  it("TC-196 | Menguji Fungsionabilitas Pada Logout", () => {
    cy.get('input[name="email"]').type('user@email.com');      // ganti dengan user valid
    cy.get('input[name="password"]').type('123123123');   // ganti password valid
    cy.get('button[type="submit"]').click();
    cy.wait(2000); // jeda 2 detik

    //Klik ikon profile di header (link ke /account)
    cy.get('div.header.grid.grid-cols-3')
    
    cy.get('div.self-center')
    
    cy.get('a[href$="/account"]').first().click(); 

    cy.url().should('include', '/account');
    cy.contains('h1', 'My Account').should('be.visible');

    //Klik Logout
    cy.contains('a.text-interactive', 'Logout').click();

    //Verifikasi logout
    cy.contains('My Account').should('not.exist');
    });
});
