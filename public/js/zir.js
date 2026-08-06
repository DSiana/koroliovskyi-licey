document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("bvi-toggle");
  const body = document.body;

  // 1. При завантаженні сторінки перевіряємо, чи був режим увімкнений раніше
  if (localStorage.getItem("bvi-mode") === "enabled") {
    body.classList.add("bvi-mode");
  }

  // 2. Якщо кнопку на сторінці знайдено, вішаємо на неї клік
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      // Перемикаємо клас на тегу body
      body.classList.toggle("bvi-mode");

      // Зберігаємо вибір у пам'ять браузера
      if (body.classList.contains("bvi-mode")) {
        localStorage.setItem("bvi-mode", "enabled");
      } else {
        localStorage.setItem("bvi-mode", "disabled");
      }
    });
  }
});
