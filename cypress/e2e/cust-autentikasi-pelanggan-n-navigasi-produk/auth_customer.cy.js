// cypress/e2e/admin-authentication.cy.js

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
  it("TC-001 | Login gagal (akun belum terdaftar)", () => {
    cy.get('input[name="email"]').type("rendi123@gmail.com");
    cy.get('input[name="password"]').type("RendiiCoyyy");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email or password").should("be.visible");
  });

  // TC-002 – Link Create an Account
  it("TC-002 | Klik link Create an account", () => {
    cy.contains("Create an account").click();
    cy.url().should("include", "/account/register");
  });

  // TC-003 – Full Name kosong
  it("TC-003 | Validasi Full Name kosong", () => {
    cy.visit(registerUrl);

    cy.get('input[name="email"]').type("valid@example.com");
    cy.get('input[name="password"]').type("SecurePassword123");
    cy.get('button[type="submit"]').click();

    cy.contains("This field can not be empty").should("be.visible");
  });

  // TC-004 – Password kosong (Register)
  it("TC-004 | Validasi Password kosong (Register)", () => {
    cy.visit(registerUrl);

    cy.get('input[name="full_name"]').type("Testing User");
    cy.get('input[name="email"]').type("valid@example.com");
    cy.get('button[type="submit"]').click();

    cy.contains("This field can not be empty").should("be.visible");
  });

  // TC-005 – Email format salah (Register)
  it("TC-005 | Validasi email salah format (Register)", () => {
    cy.visit(registerUrl);

    cy.get('input[name="full_name"]').type("New Tester");
    cy.get('input[name="email"]').type("email.tanpa@domain");
    cy.get('input[name="password"]').type("SecurePassword123");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email").should("be.visible");
  });

  // TC-006 – Register sukses
  it("TC-006 | Register sukses", () => {
    cy.visit(registerUrl);
    cy.get('input[name="full_name"]').type("User Baru");
    cy.get('input[name="email"]').type("user.valid@example.com");
    cy.get('input[name="password"]').type("SecurePassword123");
    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/account");
  });

  // TC-007 – Login sukses
  it("TC-007 | Login sukses", () => {
    cy.get('input[name="email"]').type("user.valid@example.com");
    cy.get('input[name="password"]').type("SecurePassword123");
    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/account");
  });

  // TC-008 – Password salah
  it("TC-008 | Login gagal - password salah", () => {
    cy.get('input[name="email"]').type("user.valid@example.com");
    cy.get('input[name="password"]').type("PasswordSalah456");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email or password").should("be.visible");
  });

  // TC-009 – Email tidak terdaftar
  it("TC-009 | Login gagal - email tidak terdaftar", () => {
    cy.get('input[name="email"]').type("belumterdaftar@test.com");
    cy.get('input[name="password"]').type("SecurePassword123");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email or password").should("be.visible");
  });

  // TC-010 – Email kosong
  it("TC-010 | Validasi email kosong (Login)", () => {
    cy.get('input[name="password"]').type("AnyPassword");
    cy.get('button[type="submit"]').click();

    cy.contains("This field can not be empty").should("be.visible");
  });

  // TC-011 – Password kosong
  it("TC-011 | Validasi password kosong (Login)", () => {
    cy.get('input[name="email"]').type("valid@example.com");
    cy.get('button[type="submit"]').click();

    cy.contains("This field can not be empty").should("be.visible");
  });

  // TC-012 – Format email salah
  it("TC-012 | Validasi format email salah (Login)", () => {
    cy.get('input[name="email"]').type("emailtanpaat.com");
    cy.get('input[name="password"]').type("AnyPassword");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email").should("be.visible");
  });

  // TC-013 – Forgot your password link
  it("TC-013 | Klik Forgot your password?", () => {
    cy.contains("Forgot your password?").click();
    cy.url().should("include", "/account/reset-password");
  });

  // TC-014 – Reset password sukses
  it("TC-014 | Reset password sukses", () => {
    cy.visit(resetUrl);

    cy.get('input[name="email"]').type("valid@example.com");
    cy.get('button[type="submit"]').click();

    cy.contains("We have sent you an email with a link to reset your password. Please check your inbox.").should("be.visible");
  });

  // TC-015 – Email salah format (reset password)
  it("TC-015 | Validasi format email salah (Reset Password)", () => {
    cy.visit(resetUrl);

    cy.get('input[name="email"]').type("format-salah");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email").should("be.visible");
  });

  it("TC-016 | Email kosong saat reset password", () => {
    cy.visit(resetUrl);

    cy.get('button[type="submit"]').click();

    cy.contains("This field can not be empty").should("be.visible");
  });

  it("TC-017 | Format email tidak valid saat reset password", () => {
    cy.visit(resetUrl);

    cy.get('input[name="email"]').type("emailsalahformat");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid email")
      .should("be.visible");
  });

  it("TC-018 | Password terlalu pendek", () => {
    cy.visit(registerUrl);

    const randomEmail = `test${Date.now()}@example.com`;

    cy.get('input[name="full_name"]').type("User Test");
    cy.get('input[name="email"]').type(randomEmail);
    cy.get('input[name="password"]').type("short1"); // kurang dari 8 karakter

    cy.get('button[type="submit"]').click();

    // Expected: Tidak ada error, register berhasil
    cy.url().should("include", "/account");
  });

  it("TC-019 | Full name melebihi batas 100 karakter", () => {
    cy.visit(registerUrl);

    const longName = "A".repeat(150); // 150 karakter
    const randomEmail = `test${Date.now()}@example.com`;

    cy.get('input[name="full_name"]').type(longName);
    cy.get('input[name="email"]').type(randomEmail);
    cy.get('input[name="password"]').type("password123");

    cy.get('button[type="submit"]').click();

    // Karena app tidak menolak full name panjang, maka expected-nya: register berhasil
    cy.url().should("include", "/account");
  });

  it("TC-020 | Placeholder muncul dengan benar", () => {
    cy.visit("/account/register");

    cy.get('input[name="full_name"]')
      .should("have.attr", "placeholder", "Full Name");
    cy.get('input[name="email"]')
      .should("have.attr", "placeholder", "Email");
    cy.get('input[name="password"]')
      .should("have.attr", "placeholder", "Password");
  });

  it("TC-025 | Navigasi ke Koleksi Wanita (Shop Women)", () => {
    cy.visit("/");
    cy.contains("Shop women").click();

    cy.url().should("include", "/category/women");
    cy.contains("WOMEN").should("be.visible");
  });

  it("TC-026 | Link Shop di header menuju katalog utama", () => {
    cy.visit("/");
    cy.get("header").contains("Shop").click();

    cy.url().should("include", "/products");
  });

  it("TC-028 | Tidak ada produk di kategori Women", () => {
    cy.visit("/category/women");

    cy.contains("There is no product to display").should("be.visible");
  });

  it("TC-029 | Sorting Harga: Low to High", () => {
    cy.visit("/category/women");

    cy.get('select[name="sort"]').select("Price: Low to High");

    const prices = [];

    cy.get(".product-card .price").each(($el) => {
      const price = parseFloat($el.text().replace("$", ""));
      prices.push(price);
    }).then(() => {
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).to.deep.equal(sorted);
    });
  });

  it("TC-030 | Filter harga dari 0 sampai 50", () => {
    cy.visit("/category/women");

    cy.get(".price-slider-min").invoke("val", 0).trigger("change");
    cy.get(".price-slider-max").invoke("val", 50).trigger("change");

    cy.get(".product-card .price").each(($el) => {
      const price = parseFloat($el.text().replace("$", ""));
      expect(price).to.be.within(0, 50);
    });
  });

  it("TC-032 | Ikon search menampilkan kolom input", () => {
    cy.visit("/");
    cy.get(".search-icon").click();
    cy.get('input[name="search"]').should("be.visible");
  });

  it("TC-034 | PDP menampilkan nama, harga, dan SKU", () => {
    cy.visit("/product/striped-cotton-sweater");

    cy.contains("Striped Cotton Sweater").should("be.visible");
    cy.contains("$90.00").should("be.visible");
    cy.contains("SCS-24680").should("be.visible");
  });

  it("TC-035 | Add to Cart berhasil", () => {
    cy.visit("/product/striped-cotton-sweater");

    cy.contains("ADD TO CART").click();
    cy.contains("Added to cart").should("be.visible");

    cy.get(".cart-icon .count").should("contain", "1");
  });

  it("TC-036 | Add to Cart dengan quantity 5", () => {
    cy.visit("/product/striped-cotton-sweater");

    cy.get('input[name="quantity"]').clear().type("5");
    cy.contains("ADD TO CART").click();

    cy.contains("Added to cart").should("be.visible");
    cy.get(".cart-icon .count").should("contain", "5");
  });

  it("TC-037 | Placeholder image ketika gambar tidak tersedia", () => {
    cy.visit("/product/no-image-product");

    cy.get(".image-placeholder").should("be.visible");
  });
});
