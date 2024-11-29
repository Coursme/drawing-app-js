const canvas = document.querySelector("canvas"),  // Получаем элемент canvas
    toolBtns = document.querySelectorAll(".tool"),  // Получаем все кнопки инструментов
    fillColor = document.querySelector("#fill-color"),  // Получаем чекбокс для заливки
    sizeSlider = document.querySelector("#size-slider"),  // Получаем ползунок для размера кисти
    colorBtns = document.querySelectorAll(".colors .option"),  // Получаем все кнопки выбора цвета
    colorPicker = document.querySelector("#color-picker"),  // Получаем элемент выбора цвета
    clearCanvas = document.querySelector(".clear-canvas"),  // Получаем кнопку для очистки холста
    saveImg = document.querySelector(".save-img"),  // Получаем кнопку для сохранения изображения
    ctx = canvas.getContext("2d");  // Получаем контекст рисования для canvas

// глобальные переменные с начальными значениями
let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,  // флаг рисования
    selectedTool = "brush",  // выбранный инструмент (по умолчанию кисть)
    brushWidth = 5,  // ширина кисти по умолчанию
    selectedColor = "#000";  // выбранный цвет (по умолчанию черный)

// функция для установки фона холста
const setCanvasBackground = () => {
    // устанавливаем фон холста в белый цвет, чтобы изображение при скачивании имело белый фон
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // восстанавливаем выбранный цвет для рисования
}

window.addEventListener("load", () => {
    // при загрузке страницы устанавливаем ширину и высоту холста
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground(); // устанавливаем фон холста
});

// функция для рисования прямоугольника
const drawRect = (e) => {
    // если заливка не выбрана, рисуем прямоугольник только с границей, иначе с заливкой
    if (!fillColor.checked) {
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
}

// функция для рисования круга
const drawCircle = (e) => {
    ctx.beginPath();  // начинаем новый путь для рисования
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));  // вычисляем радиус
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);  // рисуем круг
    fillColor.checked ? ctx.fill() : ctx.stroke();  // если заливка включена, заливаем, иначе рисуем только границу
}

// функция для рисования треугольника
const drawTriangle = (e) => {
    ctx.beginPath();  // начинаем новый путь
    ctx.moveTo(prevMouseX, prevMouseY);  // перемещаемся к начальной точке
    ctx.lineTo(e.offsetX, e.offsetY);  // рисуем первую линию
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);  // рисуем вторую линию, чтобы завершить треугольник
    ctx.closePath();  // закрываем путь, чтобы автоматически провести последнюю линию
    fillColor.checked ? ctx.fill() : ctx.stroke();  // если заливка включена, заливаем, иначе рисуем только границу
}

// функция для начала рисования
const startDraw = (e) => {
    isDrawing = true;  // устанавливаем флаг, что рисование начато
    prevMouseX = e.offsetX;  // сохраняем текущую позицию мыши по оси X
    prevMouseY = e.offsetY;  // сохраняем текущую позицию мыши по оси Y
    ctx.beginPath();  // начинаем новый путь
    ctx.lineWidth = brushWidth;  // устанавливаем ширину линии
    ctx.strokeStyle = selectedColor;  // устанавливаем цвет линии
    ctx.fillStyle = selectedColor;  // устанавливаем цвет заливки
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);  // сохраняем снимок текущего состояния холста
}

// функция для рисования
const drawing = (e) => {
    if (!isDrawing) return;  // если не рисуем, выходим из функции
    ctx.putImageData(snapshot, 0, 0);  // восстанавливаем снимок холста

    // проверяем, какой инструмент выбран
    if (selectedTool === "brush" || selectedTool === "eraser") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;  // если выбран ластик, цвет линии будет белым
        ctx.lineTo(e.offsetX, e.offsetY);  // рисуем линию в соответствии с движением мыши
        ctx.stroke();  // рисуем/заполняем линию
    } else if (selectedTool === "rectangle") {
        drawRect(e);  // рисуем прямоугольник
    } else if (selectedTool === "circle") {
        drawCircle(e);  // рисуем круг
    } else {
        drawTriangle(e);  // рисуем треугольник
    }
}

// добавляем обработчики событий для инструментов
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        // убираем активный класс с предыдущей кнопки и добавляем на текущую
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;  // устанавливаем выбранный инструмент
    });
});

// добавляем обработчик для изменения размера кисти
sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);  // устанавливаем ширину кисти

// добавляем обработчики для изменения цвета
colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        // убираем класс выбранного цвета с предыдущей кнопки и добавляем на текущую
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        // получаем цвет выбранной кнопки и устанавливаем его как текущий
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

// обработчик изменения цвета через цветовой пикер
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;  // меняем фон родительского элемента
    colorPicker.parentElement.click();  // активируем родительский элемент, чтобы изменить цвет
});

// добавляем обработчик для очистки холста
clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // очищаем холст
    setCanvasBackground();  // восстанавливаем фон холста
});

// добавляем обработчик для сохранения изображения
saveImg.addEventListener("click", () => {
    const link = document.createElement("a");  // создаем ссылку для скачивания
    link.download = `${Date.now()}.jpg`;  // задаем имя файла с текущей меткой времени
    link.href = canvas.toDataURL();  // получаем данные изображения с холста
    link.click();  // имитируем клик по ссылке для скачивания
});

// добавляем обработчики событий для рисования
canvas.addEventListener("mousedown", startDraw);  // начало рисования при нажатии кнопки мыши
canvas.addEventListener("mousemove", drawing);  // рисуем при движении мыши
canvas.addEventListener("mouseup", () => isDrawing = false);  // прекращаем рисование при отпускании кнопки мыши
