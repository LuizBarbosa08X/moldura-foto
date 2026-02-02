// Estado da Aplicação
const state = {
    image: null,
    zoom: 60,
    positionX: 0,
    positionY: 0,
    canvas: null,
    ctx: null,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    shapeMode: 'square',
    customFrame: null
};

// Configurações de Molduras
const frameConfigs = {
    classic: {
        color: '#8B4513',
        style: 'solid',
        pattern: null
    },
    modern: {
        color: '#333333',
        style: 'gradient',
        pattern: 'modern'
    },
    gold: {
        color: '#FFD700',
        style: 'gradient',
        pattern: 'gold'
    },
    vintage: {
        color: '#D4A574',
        style: 'gradient',
        pattern: 'vintage'
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    createCanvas();
    setupEventListeners();
    loadMoldura();
});

// Carregar Moldura
function loadMoldura() {
    const molduraPath = 'assets/frames/MOLDURA FOTO.png';
    const img = new Image();
    img.onload = function() {
        state.customFrame = img;
        drawPreview();
    };
    img.onerror = function() {
        console.error('Erro ao carregar moldura: ' + molduraPath);
    };
    img.src = molduraPath;
}

// Criar Canvas
function createCanvas() {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = '';
    
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    canvas.width = 600;
    canvas.height = 600;
    
    previewContainer.appendChild(canvas);
    state.canvas = canvas;
    state.ctx = canvas.getContext('2d');
}

// Configurar Event Listeners
function setupEventListeners() {
    // Upload de Foto
    const uploadArea = document.getElementById('uploadArea');
    const photoUpload = document.getElementById('photo-upload');

    uploadArea.addEventListener('click', () => photoUpload.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    photoUpload.addEventListener('change', handlePhotoUpload);

    // Sliders
    document.getElementById('zoom-slider').addEventListener('input', handleZoomChange);

    // Canvas - Drag and Drop para posicionar
    const canvas = document.getElementById('canvas');
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('mouseleave', handleCanvasMouseUp);
    canvas.addEventListener('touchstart', handleCanvasTouchStart);
    canvas.addEventListener('touchmove', handleCanvasTouchMove);
    canvas.addEventListener('touchend', handleCanvasTouchEnd);

    // Botões de Ação
    document.getElementById('resetBtn').addEventListener('click', handleReset);
    document.getElementById('downloadBtn').addEventListener('click', handleDownload);
}

// Manipulação de Drag and Drop
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handlePhotoUploadFile(files[0]);
    }
}

// Upload de Foto
function handlePhotoUpload(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handlePhotoUploadFile(files[0]);
    }
}

function handlePhotoUploadFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            state.image = img;
            state.positionX = 0;
            state.positionY = 0;
            drawPreview();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Seleção de Forma
function handleShapeSelection(btn) {
    document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.shapeMode = btn.dataset.shape;
    drawPreview();
}

// Mudança de Zoom
function handleZoomChange(e) {
    state.zoom = parseInt(e.target.value);
    document.getElementById('zoomValue').textContent = state.zoom;
    drawPreview();
}

// Handlers para Drag and Drop do Canvas (Mouse)
function handleCanvasMouseDown(e) {
    if (!state.image) return;
    state.isDragging = true;
    state.dragStartX = e.clientX || e.pageX;
    state.dragStartY = e.clientY || e.pageY;
}

function handleCanvasMouseMove(e) {
    if (!state.isDragging || !state.image) return;
    
    const currentX = e.clientX || e.pageX;
    const currentY = e.clientY || e.pageY;
    
    const deltaX = currentX - state.dragStartX;
    const deltaY = currentY - state.dragStartY;
    
    state.positionX += deltaX * 0.5;
    state.positionY += deltaY * 0.5;
    
    state.dragStartX = currentX;
    state.dragStartY = currentY;
    
    drawPreview();
}

function handleCanvasMouseUp() {
    state.isDragging = false;
}

// Handlers para Drag and Drop do Canvas (Touch)
function handleCanvasTouchStart(e) {
    if (!state.image) return;
    state.isDragging = true;
    state.dragStartX = e.touches[0].clientX;
    state.dragStartY = e.touches[0].clientY;
}

function handleCanvasTouchMove(e) {
    if (!state.isDragging || !state.image) return;
    e.preventDefault();
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const deltaX = currentX - state.dragStartX;
    const deltaY = currentY - state.dragStartY;
    
    state.positionX += deltaX * 0.5;
    state.positionY += deltaY * 0.5;
    
    state.dragStartX = currentX;
    state.dragStartY = currentY;
    
    drawPreview();
}

function handleCanvasTouchEnd() {
    state.isDragging = false;
}

// Reset
function handleReset() {
    if (confirm('Tem certeza que deseja resetar todas as configurações?')) {
        state.zoom = 60;
        state.positionX = 0;
        state.positionY = 0;
        state.shapeMode = 'square';

        document.getElementById('zoom-slider').value = 60;
        document.getElementById('zoomValue').textContent = '60';

        drawPreview();
    }
}

// Download
function handleDownload() {
    if (!state.image) {
        alert('Por favor, carregue uma foto primeiro');
        return;
    }

    // Criar um canvas maior para alta qualidade
    const downloadCanvas = document.createElement('canvas');
    const scale = 2;
    downloadCanvas.width = state.canvas.width * scale;
    downloadCanvas.height = state.canvas.height * scale;
    
    const downloadCtx = downloadCanvas.getContext('2d');
    downloadCtx.scale(scale, scale);

    // Desenhar no canvas de download
    drawOnCanvas(downloadCtx, state.canvas.width, state.canvas.height);

    // Fazer download
    downloadCanvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `moldura-foto-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
}

// Desenhar Preview
function drawPreview() {
    drawOnCanvas(state.ctx, state.canvas.width, state.canvas.height);
}

// Desenhar no Canvas
function drawOnCanvas(ctx, width, height) {
    // Limpar canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (!state.customFrame) {
        ctx.fillStyle = '#f0f0f0';
        ctx.font = '16px Arial';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('Carregue uma moldura para começar', width / 2, height / 2);
        return;
    }

    if (!state.image) {
        // Apenas desenha moldura
        ctx.drawImage(state.customFrame, 0, 0, width, height);
        return;
    }

    const frameSize = 0;
    const innerWidth = width;
    const innerHeight = height;

    // PRIMEIRO: Desenhar a FOTO com clipping
    ctx.save();

    // Criar clipping area baseado no formato
    ctx.beginPath();
    if (state.shapeMode === 'circle') {
        // Circular
        ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2);
    } else {
        // Quadrado
        ctx.rect(0, 0, innerWidth, innerHeight);
    }
    ctx.clip();

    // Calcular dimensões da imagem com zoom
    const zoomScale = state.zoom / 100;
    const scaledWidth = state.image.width * zoomScale;
    const scaledHeight = state.image.height * zoomScale;

    // Centralizar imagem
    const centerX = (innerWidth - scaledWidth) / 2;
    const centerY = (innerHeight - scaledHeight) / 2;

    // Desenhar imagem com posicionamento
    ctx.drawImage(
        state.image,
        centerX + state.positionX,
        centerY + state.positionY,
        scaledWidth,
        scaledHeight
    );

    // Restaurar estado
    ctx.restore();

    // SEGUNDO: Desenhar moldura POR CIMA
    ctx.drawImage(state.customFrame, 0, 0, width, height);
}

// Desenhar Moldura
function drawFrame(ctx, frameSize, width, height) {
    // Apenas moldura customizada agora
}

// Inicializar com mensagem
console.log('🖼️ Moldura Foto - Sistema carregado com sucesso!');
