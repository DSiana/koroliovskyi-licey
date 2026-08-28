require("dotenv").config();
const nodemailer = require("nodemailer");
const express = require("express");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const { marked } = require("marked");
app.locals.marked = marked;

// 1. Вказуємо Express, що ми використовуємо EJS як шаблонізатор
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
// Явно вказуємо, що наші шаблони лежать у папці "views"
app.set("views", path.join(__dirname, "views"));

// 2. Робимо папку "public" (CSS, JS, картинки) доступною для браузера
app.use(express.static(path.join(__dirname, "public")));

// 3. Дозволяємо серверу читати дані, відправлені через HTML-форми
app.use(express.urlencoded({ extended: true }));

// --- МАРШРУТИ (РОУТИ) СТОРІНОК ---

// Головна сторінка
app.get("/", (req, res) => {
  const settingsPath = path.join(__dirname, "data", "settings.json");

  let siteSettings = {};
  try {
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    siteSettings = JSON.parse(settingsData);
  } catch (err) {
    console.error("Помилка читання налаштувань:", err);
  }

  res.render("index", { mainText: siteSettings.mainPageText });
});

app.get("/index", (req, res) => {
  const settingsPath = path.join(__dirname, "data", "settings.json");

  // Читаємо файл налаштувань
  let siteSettings = {};
  try {
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    siteSettings = JSON.parse(settingsData);
  } catch (err) {
    console.error("Помилка читання налаштувань:", err);
  }

  // Передаємо текст у шаблон index.ejs
  res.render("index", { mainText: siteSettings.mainPageText });
});

app.get("/pro-nas", (req, res) => {
  const settingsPath = path.join(__dirname, "data", "settings.json");

  // Читаємо файл налаштувань
  let siteSettings = {};
  try {
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    siteSettings = JSON.parse(settingsData);
  } catch (err) {
    console.error("Помилка читання налаштувань:", err);
  }

  // Передаємо текст у шаблон
  res.render("pro-nas", { pronasText: siteSettings.pronasText });
});

// Сторінка новин (зчитує дані з JSON)
app.get("/novyny", (req, res) => {
  const dataPath = path.join(__dirname, "data", "novyny.json");

  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      console.error("Помилка читання файлу новин:", err);
      // Якщо файлу ще немає, передаємо порожній масив, щоб не зламати сторінку
      return res.render("novyny", { newsList: [] });
    }

    try {
      const parsedData = JSON.parse(data);
      const allNews = parsedData.items || [];
      // Відфільтровуємо лише активні новини (неархівовані)
      const activeNews = allNews.filter((item) => !item.archived);

      // Віддаємо шаблон news.ejs і передаємо туди масив новин
      res.render("novyny", { newsList: activeNews });
    } catch (parseError) {
      console.error("Помилка парсингу JSON:", parseError);
      res.render("novyny", { newsList: [] });
    }
  });
});

app.get("/director", (req, res) => {
  const settingsPath = path.join(__dirname, "data", "settings.json");

  let siteSettings = {};
  try {
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    siteSettings = JSON.parse(settingsData);
  } catch (err) {
    console.error("Помилка читання налаштувань:", err);
  }

  // Передаємо текст у шаблон
  res.render("director", {
    directorPhoto: siteSettings.directorPhoto,
    directorPIB: siteSettings.directorPIB,
    directorText: siteSettings.directorText,
  });
});

// Роут для сторінки Адміністрації
app.get("/administracia", (req, res) => {
  const teamPath = path.join(__dirname, "data", "colectyv.json");
  const settingsPath = path.join(__dirname, "data", "settings.json");

  // Читаємо файл налаштувань
  let siteSettings = {};
  try {
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    siteSettings = JSON.parse(settingsData);
  } catch (err) {
    console.error("Помилка читання налаштувань:", err);
  }

  fs.readFile(teamPath, "utf8", (err, data) => {
    if (err) {
      return res.render("administracia", { adminList: [], banner: "" });
    }

    try {
      const parsedData = JSON.parse(data);
      const allStaff = parsedData.items || [];

      // Сортуємо працівників
      const adminList = allStaff.filter(
        (person) => person.category === "admin",
      );

      // Передаємо
      res.render("administracia", {
        adminList: adminList,
        banner: siteSettings.adminBanner,
      });
    } catch (error) {
      console.error("Помилка парсингу працівників:", error);
      res.render("administracia", { adminList: [], banner: "" });
    }
  });
});

// Роут для сторінки Кафедри (Вчителі)
app.get("/kafedry", (req, res) => {
  const teamPath = path.join(__dirname, "data", "colectyv.json");
  const settingsPath = path.join(__dirname, "data", "settings.json");

  // Читаємо файл налаштувань
  let siteSettings = {};
  try {
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    siteSettings = JSON.parse(settingsData);
  } catch (err) {
    console.error("Помилка читання налаштувань:", err);
  }

  fs.readFile(teamPath, "utf8", (err, data) => {
    if (err) {
      return res.render("kafedry", { teacherList: [], banner: "" });
    }

    try {
      const parsedData = JSON.parse(data);
      const allStaff = parsedData.items || [];

      // Сортуємо працівників
      const teacherList = allStaff.filter(
        (person) => person.category === "teacher",
      );

      // Передаємо у шаблон kafedry.ejs
      res.render("kafedry", {
        teacherList: teacherList,
        banner: siteSettings.kafedryBanner,
      });
    } catch (error) {
      console.error("Помилка парсингу працівників:", error);
      res.render("kafedry", { teacherList: [], banner: "" });
    }
  });
});

// Сторінка галереї
app.get("/galereia", (req, res) => {
  const galleryPath = path.join(__dirname, "data", "galereia.json");

  fs.readFile(galleryPath, "utf8", (err, data) => {
    // Якщо файлу раптом немає, або сталася помилка читання - віддаємо порожній список
    if (err) {
      return res.render("galereia", { galleryList: [] });
    }

    try {
      // Парсимо JSON
      const parsedData = JSON.parse(data);
      // Беремо масив items. Якщо він порожній або його немає, використовуємо []
      const photos = parsedData.items || [];

      // Передаємо фотографії у шаблон galereia.ejs
      res.render("galereia", { galleryList: photos });
    } catch (error) {
      console.error("Помилка парсингу галереї:", error);
      res.render("galereia", { galleryList: [] });
    }
  });
});

// Сторінка контактів
app.get("/contacty", (req, res) => {
  res.render("contacty");
});

// Роут для окремої сторінки новини
app.get("/novyny/:id", (req, res) => {
  const newsId = req.params.id; // Отримуємо ID з посилання (наприклад, pershyj-dzvonyk-2026)
  const dataPath = path.join(__dirname, "data", "novyny.json");

  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Помилка читання бази новин.");
    }

    try {
      const parsedData = JSON.parse(data);
      const allNews = parsedData.items || [];

      // Шукаємо новину, у якої id збігається з тим, що в адресному рядку
      const foundArticle = allNews.find((item) => item.id === newsId);

      if (foundArticle) {
        // Якщо знайшли - віддаємо шаблон і передаємо туди цю новину
        res.render("new", { article: foundArticle });
      } else {
        // Якщо такої новини немає
        res.status(404).send("<h1>Помилка 404: Новину не знайдено</h1>");
      }
    } catch (parseError) {
      console.error("Помилка парсингу новин:", parseError);
      res.status(500).send("Внутрішня помилка сервера.");
    }
  });
});

// ==========================================
// АВТОРИЗАЦІЯ DECAP CMS ЧЕРЕЗ GITHUB (OAuth)
// ==========================================

// 1. Відправляємо адміністратора на сторінку логіну GitHub
app.get("/auth", (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;
  res.redirect(githubAuthUrl);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("Помилка: Немає коду від GitHub");

  try {
    // Обмінюємо код на токен доступу
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    // Якщо GitHub повернув помилку замість токена
    if (tokenData.error) {
      return res.send(`
        <h2 style="color: red;">Помилка від GitHub</h2>
        <p><strong>Тип:</strong> ${tokenData.error}</p>
        <p><strong>Опис:</strong> ${tokenData.error_description}</p>
      `);
    }

    const script = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>GitHub Authorization</title>
    </head>
    <body>
      <p>Авторизація успішна! Передаємо дані в Decap CMS...</p>

      <script>
        const receiveMessage = (message) => {
          if (!window.opener) {
            return;
          }

          window.opener.postMessage(
            'authorization:github:success:${JSON.stringify({
              token: tokenData.access_token,
              backend: "github",
            })}',
            message.origin
          );

          window.removeEventListener("message", receiveMessage, false);
          window.close();
        };

        window.addEventListener("message", receiveMessage, false);

        window.opener.postMessage("authorizing:github", "*");
      </script>
    </body>
    </html>
    `;

    res.send(script);
  } catch (error) {
    console.error("Помилка авторизації:", error);
    res.send("Помилка під час з'єднання з GitHub.");
  }
});

// Перехоплюємо і ігноруємо запити на іконку вкладки, щоб не "ламати" сервер
app.get("/favicon.ico", (req, res) => res.status(204).end());

// --- УНІВЕРСАЛЬНИЙ РОУТ ДЛЯ ДИНАМІЧНИХ СТОРІНОК ---

app.get("/:pageName", (req, res, next) => {
  const page = req.params.pageName;

  // Не намагаємося рендерити файли типу .css, .js, .png тощо.
  // express.static вже мав можливість їх обробити.
  if (page.includes(".")) {
    return next();
  }

  // Дозволяємо тільки безпечні назви сторінок:
  // літери, цифри, дефіс та підкреслення.
  if (!/^[a-zA-Z0-9_-]+$/.test(page)) {
    return res.status(404).send("<h1>404: Сторінку не знайдено</h1>");
  }

  const docsPath = path.join(__dirname, "data", "doc.json");

  fs.readFile(docsPath, "utf8", (err, data) => {
    let filteredDocs = [];

    // Якщо doc.json існує — читаємо його.
    if (!err) {
      try {
        const parsedData = JSON.parse(data);
        const allDocs = Array.isArray(parsedData.items) ? parsedData.items : [];

        filteredDocs = allDocs.filter((doc) => doc && doc.category === page);
      } catch (e) {
        console.error("Помилка парсингу doc.json:", e);
        // Не падаємо — просто передаємо порожній список.
        filteredDocs = [];
      }
    } else {
      console.error("Не вдалося прочитати doc.json:", err.message);
    }

    // Спробувати відрендерити відповідний EJS-шаблон.
    res.render(page, { docsList: filteredDocs }, (renderErr, html) => {
      if (renderErr) {
        console.error(
          `Сторінку "${page}.ejs" не знайдено або не вдалося відрендерити:`,
          renderErr.message,
        );

        return res.status(404).send("<h1>404: Сторінку не знайдено</h1>");
      }

      return res.send(html);
    });
  });
});

// --- ОБРОБКА ФОРМИ ЗВОРОТНОГО ЗВ'ЯЗКУ ---
app.post("/send-message", async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // 2. Формуємо та відправляємо сам лист
    await transporter.sendMail({
      from: `"Сайт Ліцею" <${process.env.EMAIL_USER}>`,
      to: "a.liceumzt@gmail.com",
      subject: `Нове повідомлення з сайту від ${name}`,
      html: `
        <h3 style="color: #8a2be2;">Нове повідомлення через форму контактів</h3>
        <p><strong>Ім'я:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Повідомлення:</strong><br>${message}</p>
      `,
    });

    // 3. Відправляємо красиву відповідь користувачу
    res.send(`
      <div style="font-family: 'Open Sans', sans-serif; text-align: center; margin-top: 10dvh; background-color: #f8f8f6ff; padding: 40px; border-radius: 10px; max-width: 600px; margin-left: auto; margin-right: auto;">
        <h1 style="color: #1a2545ff; font-family: 'Oswald', sans-serif; text-transform: uppercase;">Дякуємо, ${name}!</h1>
        <p style="font-size: 18px; color: #f8f8f6ff;">Ваше повідомлення успішно надіслано.</p>
        <br>
        <a href="/contacty" style="display: inline-block; padding: 10px 20px; background-color: #1a2545ff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Повернутися назад</a>
      </div>
    `);
  } catch (error) {
    console.error("Помилка відправки листа:", error);
    res
      .status(500)
      .send(
        "Вибачте, сталася помилка при відправці повідомлення. Спробуйте пізніше.",
      );
  }
});

// --- ВЕБХУК ДЛЯ ОНОВЛЕННЯ DATA ТА ASSETS ---

app.post("/github-webhook", (req, res) => {
  const secret = req.query.secret;

  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(403).send("Невірний секретний ключ.");
  }

  // GitHub отримує відповідь одразу
  res.status(200).send("Webhook прийнято.");

  const logFile = path.join(__dirname, "git-error.txt");

  // Отримуємо актуальний стан origin/main,
  // але НЕ змінюємо робочі файли всього репозиторію.
  exec(
    "git fetch origin && git checkout origin/main -- data public/assets",
    {
      cwd: __dirname,
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: "0",
      },
    },
    (error, stdout, stderr) => {
      const result = [
        `TIME: ${new Date().toISOString()}`,
        `CWD: ${__dirname}`,
        "",
        `ERROR: ${error ? error.message : "none"}`,
        `CODE: ${error ? error.code : "none"}`,
        "",
        "STDOUT:",
        stdout,
        "",
        "STDERR:",
        stderr,
      ].join("\n");

      try {
        fs.writeFileSync(logFile, result);
      } catch (logError) {
        console.error(
          "Не вдалося записати git-error.txt:",
          logError
        );
      }

      if (error) {
        console.error("Помилка оновлення data/assets:", error);
      } else {
        console.log("data/ та public/assets/ оновлено.");
      }
    }
  );
});

// --- ЗАПУСК СЕРВЕРА ---
app.listen(PORT, () => {
  console.log(`Сервер успішно запущено`);
  console.log(`Перейдіть у браузері за адресою: http://localhost:${PORT}`);
});
