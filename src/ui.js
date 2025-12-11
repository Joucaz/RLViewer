// src/ui.js

export default class UIManager {
    constructor() {
        this.carConfig = {
            fennec: { name: 'Fennec', thumbnail: 'textures/cars/fennec/thumbnail.jpg' },
            octane: { name: 'Octane', thumbnail: 'textures/cars/octane/thumbnail.jpg' },
            dominus: { name: 'Dominus', thumbnail: 'textures/cars/dominus/thumbnail.jpg' }
        };

        this.wheelConfig = {
            alpha: { name: 'Alpha', thumbnail: 'textures/wheels/alpha/thumbnail.jpg' },
            cristiano: { name: 'Cristiano', thumbnail: 'textures/wheels/cristiano/thumbnail.jpg' },
            dieci: { name: 'Dieci', thumbnail: 'textures/wheels/dieci/thumbnail.jpg' }
        };

        this.currentCar = 'fennec';
        this.currentWheel = 'alpha';
        this.currentPaintColor = '#171617';

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupCategoryHover();
            this.setupCarSelection();
            this.setupWheelSelection();
            this.setupPaintSelection();
            this.setupTextureUpload();
        });
    }

    setupCategoryHover() {
        const categoryItems = document.querySelectorAll('.category-item');
        const panelContents = document.querySelectorAll('.panel-content');
        const selectionPanel = document.getElementById('selection-panel');

        categoryItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const category = item.dataset.category;
                
                categoryItems.forEach(cat => cat.classList.remove('active'));
                item.classList.add('active');
                
                panelContents.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.dataset.panel === category) {
                        panel.classList.add('active');
                    }
                });
                
                selectionPanel.classList.add('visible');
            });
        });

        document.querySelector('.customization-ui').addEventListener('mouseleave', () => {
            selectionPanel.classList.remove('visible');
        });
    }

    setupCarSelection() {
        document.querySelectorAll('[data-car]').forEach(btn => {
            btn.addEventListener('click', () => {
                const carType = btn.dataset.car;
                this.updateCarSelection(carType);
            });
        });
    }

    setupWheelSelection() {
        document.querySelectorAll('[data-wheel]').forEach(btn => {
            btn.addEventListener('click', () => {
                const wheelType = btn.dataset.wheel;
                this.updateWheelSelection(wheelType);
            });
        });
    }

    setupPaintSelection() {
        document.querySelectorAll('.color-option').forEach(colorBtn => {
            colorBtn.addEventListener('click', () => {
                const color = colorBtn.dataset.color;
                this.updatePaintColor(color);
            });
        });
    }

    setupTextureUpload() {
        const fileInput = document.getElementById('texture-upload');
        const texturePreview = document.getElementById('texture-preview');
        const texturePreviewImg = document.getElementById('texture-preview-img');
        const resetBtn = document.getElementById('reset-texture');

        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.type.match('image/png') && !file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
                alert('Please select a PNG or JPG image!');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('Image too large! Maximum size is 5MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const dataURL = e.target.result;
                
                texturePreviewImg.src = dataURL;
                texturePreview.style.display = 'block';
                resetBtn.style.display = 'block';
                
                if (window.experience?.world?.carsManager) {
                    const customTextureManager = window.experience.world.carsManager.customTextureManager;
                    const currentCar = window.experience.world.carsManager.selectedCarType;
                    
                    customTextureManager.loadFromFile(currentCar, file).then(texture => {
                        if (window.experience.world.carsManager.currentCar?.customizer) {
                            window.experience.world.carsManager.currentCar.customizer.applyCustomTexture(texture);
                        }
                    });
                }
            };
            
            reader.readAsDataURL(file);
            event.target.value = '';
        });

        resetBtn.addEventListener('click', () => {
            texturePreview.style.display = 'none';
            texturePreviewImg.src = '';
            resetBtn.style.display = 'none';
            
            if (window.experience?.world?.carsManager?.currentCar?.customizer) {
                window.experience.world.carsManager.currentCar.customizer.resetBodyTexture();
                
                const customTextureManager = window.experience.world.carsManager.customTextureManager;
                const currentCar = window.experience.world.carsManager.selectedCarType;
                customTextureManager.removeTexture(currentCar);
            }
        });
    }

    updateCarSelection(newCar) {
        this.currentCar = newCar;

        const carCategory = document.querySelector('[data-category="car"]');
        carCategory.querySelector('.category-thumbnail').src = this.carConfig[newCar].thumbnail;
        carCategory.querySelector('.category-thumbnail').alt = this.carConfig[newCar].name;
        carCategory.querySelector('.category-name').textContent = this.carConfig[newCar].name;

        document.querySelectorAll('[data-car]').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-car="${newCar}"]`).classList.add('active');

        if (window.experience?.world?.carsManager) {
            window.experience.world.carsManager.switchCar(newCar);
        }
    }

    updateWheelSelection(newWheel) {
        this.currentWheel = newWheel;

        const wheelCategory = document.querySelector('[data-category="wheels"]');
        wheelCategory.querySelector('.category-thumbnail').src = this.wheelConfig[newWheel].thumbnail;
        wheelCategory.querySelector('.category-thumbnail').alt = this.wheelConfig[newWheel].name;
        wheelCategory.querySelector('.category-name').textContent = this.wheelConfig[newWheel].name;

        document.querySelectorAll('[data-wheel]').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-wheel="${newWheel}"]`).classList.add('active');

        if (window.experience?.world?.carsManager) {
            window.experience.world.carsManager.switchWheels(newWheel);
        }
    }

    updatePaintColor(color) {
        this.currentPaintColor = color;

        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('active');
        });
        document.querySelector(`[data-color="${color}"]`).classList.add('active');

        const paintCategory = document.querySelector('[data-category="paint"]');
        paintCategory.querySelector('.category-color-preview').style.background = color;

        if (window.experience?.world?.carsManager?.currentCar) {
            window.experience.world.carsManager.currentCar.setPaintColor(color);
        }
    }
}