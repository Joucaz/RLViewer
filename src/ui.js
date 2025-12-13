// src/ui.js

import Experience from "./Experience/Experience";

export default class UIManager {
    constructor() {

        this.experience = new Experience()

        this.carConfig = {
            fennec: { name: 'Fennec', thumbnail: 'images/thumbnails/car/FennecThumbnail.png' },
            octane: { name: 'Octane', thumbnail: 'images/thumbnails/car/OctaneThumbnail.png' },
            dominus: { name: 'Dominus', thumbnail: 'images/thumbnails/car/DominusThumbnail.png' }
        };

        this.wheelConfig = {
            alpha: { name: 'Alpha', thumbnail: 'images/thumbnails/wheels/AlphaThumbnail.png' },
            cristiano: { name: 'Cristiano', thumbnail: 'images/thumbnails/wheels/CristianoThumbnail.png' },
            dieci: { name: 'Dieci', thumbnail: 'images/thumbnails/wheels/DieciThumbnail.png' }
        };

        this.currentCar = 'octane';
        this.currentWheel = 'dieci';
        this.currentPaintColor = '#171617';
        this.currentWheelColor = '#1c1c1c';
        this.currentFinish = 'anodized';

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupCategoryHover();
            this.setupCarSelection();
            this.setupWheelSelection();
            this.setupPaintSelection();
            this.setupWheelPaintSelection();
            this.setupFinishSelection();
            this.setupTextureUpload();
            this.setupAnimateButton();
            this.setupScreenshotButton();
            this.setupSettings();
        });
    }

    setupCategoryHover() {
        const categoryItems = document.querySelectorAll('.category-item');
        const panelContents = document.querySelectorAll('.panel-content');
        const selectionPanel = document.getElementById('selection-panel');

        categoryItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const category = item.dataset.category;
                
                // Ignore si c'est un bouton action (animate, screenshot)
                if (!category) return;
                
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
        // Preset colors
        document.querySelectorAll('[data-color]').forEach(colorBtn => {
            colorBtn.addEventListener('click', () => {
                const color = colorBtn.dataset.color;
                this.updatePaintColor(color);
            });
        });

        // Color picker
        const colorPicker = document.getElementById('paint-color-picker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                this.updatePaintColor(e.target.value);
            });
        }
    }

    setupWheelPaintSelection() {
        // Preset colors pour wheels
        document.querySelectorAll('[data-wheel-color]').forEach(colorBtn => {
            colorBtn.addEventListener('click', () => {
                const color = colorBtn.dataset.wheelColor;
                this.updateWheelColor(color);
            });
        });

        // Color picker pour wheels
        const wheelColorPicker = document.getElementById('wheel-color-picker');
        if (wheelColorPicker) {
            wheelColorPicker.addEventListener('input', (e) => {
                this.updateWheelColor(e.target.value);
            });
        }
    }

    setupFinishSelection() {
        const finishSelect = document.getElementById('finish-select');
        if (finishSelect) {
            finishSelect.addEventListener('change', (e) => {
                const finish = e.target.value;
                this.updateFinish(finish);
            });
        }
    }

    setupTextureUpload() {
        const fileInput = document.getElementById('texture-upload');
        const texturePreview = document.getElementById('texture-preview');
        const texturePreviewImg = document.getElementById('texture-preview-img');
        const resetBtn = document.getElementById('reset-texture');

        if (!fileInput || !texturePreview || !resetBtn) return;

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
                
                if (this.experience?.world?.carsManager) {
                    const customTextureManager = this.experience.world.carsManager.customTextureManager;
                    const currentCar = this.experience.world.carsManager.selectedCarType;
                    
                    customTextureManager.loadFromFile(currentCar, file).then(texture => {
                        if (this.experience.world.carsManager.currentCar?.customizer) {
                            this.experience.world.carsManager.currentCar.customizer.applyCustomTexture(texture);
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
            
            if (this.experience?.world?.carsManager?.currentCar?.customizer) {
                this.experience.world.carsManager.currentCar.customizer.resetBodyTexture();
                
                const customTextureManager = this.experience.world.carsManager.customTextureManager;
                const currentCar = this.experience.world.carsManager.selectedCarType;
                customTextureManager.removeTexture(currentCar);
            }
        });
    }

    setupAnimateButton() {
        const animateBtn = document.getElementById('animate-car');
        if (animateBtn) {
            animateBtn.addEventListener('click', () => {
                console.log('🎬 Animate car clicked!');
                // TODO: Implémenter l'animation
                // if (this.experience?.camera?.controls) {
                //     this.experience.camera.controls.autoRotate = !this.experience.camera.controls.autoRotate;
                // }
                alert('Animation feature coming soon! 🎬');
            });
        }
    }

    setupScreenshotButton() {
        const screenshotBtn = document.getElementById('screenshot-btn');
        if (screenshotBtn) {
            screenshotBtn.addEventListener('click', () => {
                console.log('📸 Screenshot clicked!');
                this.takeScreenshot();
            });
        }
    }

    takeScreenshot() {
        if (!this.experience?.renderer?.instance) {
            alert('Renderer not ready!');
            return;
        }

        try {
            const canvas = this.experience.renderer.instance.domElement;
            const dataURL = canvas.toDataURL('image/png');
            
            // Crée un lien de téléchargement
            const link = document.createElement('a');
            link.download = `rl-viewer-${Date.now()}.png`;
            link.href = dataURL;
            link.click();
            
            console.log('✅ Screenshot saved!');
        } catch (error) {
            console.error('❌ Screenshot failed:', error);
            alert('Failed to take screenshot!');
        }
    }

    setupSettings() {
        // Music toggle
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle) {
            musicToggle.addEventListener('change', (e) => {
                console.log('🎵 Music:', e.target.checked ? 'ON' : 'OFF');
                // TODO: Implémenter le toggle de musique
            });
        }

        // Auto rotation toggle
        const rotationToggle = document.getElementById('rotation-toggle');
        if (rotationToggle) {
            rotationToggle.addEventListener('change', (e) => {
                if (this.experience?.camera?.controls) {
                    this.experience.camera.controls.autoRotate = e.target.checked;
                    console.log('🔄 Auto rotation:', e.target.checked ? 'ON' : 'OFF');
                }
            });
        }

        // Rotation speed
        const rotationSpeed = document.getElementById('rotation-speed');
        const rotationSpeedValue = document.getElementById('rotation-speed-value');
        if (rotationSpeed && rotationSpeedValue) {
            rotationSpeed.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                rotationSpeedValue.textContent = value.toFixed(1);
                
                if (this.experience?.camera?.controls) {
                    this.experience.camera.controls.autoRotateSpeed = value;
                    console.log('⚡ Rotation speed:', value);
                }
            });
        }

        // Light intensity
        const lightIntensity = document.getElementById('light-intensity');
        const lightIntensityValue = document.getElementById('light-intensity-value');
        if (lightIntensity && lightIntensityValue) {
            lightIntensity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                lightIntensityValue.textContent = value;
                
                if (this.experience?.world?.environment?.directionalLight) {
                    this.experience.world.environment.directionalLight.intensity = value;
                    console.log('💡 Light intensity:', value);
                }
            });
        }

        // Environment intensity
        const envIntensity = document.getElementById('env-intensity');
        const envIntensityValue = document.getElementById('env-intensity-value');
        if (envIntensity && envIntensityValue) {
            envIntensity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                envIntensityValue.textContent = value.toFixed(1);
                
                if (this.experience?.world?.environment?.environmentMap) {
                    this.experience.world.environment.environmentMap.intensity = value;
                    this.experience.world.environment.environmentMap.updateMaterials();
                    console.log('🌍 Environment intensity:', value);
                }
            });
        }
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

        if (this.experience?.world?.carsManager) {
            this.experience.world.carsManager.switchCar(newCar);
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

        if (this.experience?.world?.carsManager) {
            this.experience.world.carsManager.switchWheels(newWheel);
        }
    }

    updatePaintColor(color) {
        this.currentPaintColor = color;

        // Met à jour le color picker
        const colorPicker = document.getElementById('paint-color-picker');
        if (colorPicker) {
            colorPicker.value = color;
        }

        // Met à jour les preset colors
        document.querySelectorAll('[data-color]').forEach(opt => {
            opt.classList.remove('active');
        });
        const activePreset = document.querySelector(`[data-color="${color}"]`);
        if (activePreset) {
            activePreset.classList.add('active');
        }

        // Met à jour la catégorie Paint
        const paintCategory = document.querySelector('[data-category="paint"]');
        if (paintCategory) {
            const preview = paintCategory.querySelector('.category-color-preview');
            if (preview) {
                preview.style.background = color;
            }
        }

        // Applique à Three.js
        if (this.experience?.world?.carsManager?.currentCar) {
            this.experience.world.carsManager.currentCar.setPaintColor(color);
        }
    }

    updateWheelColor(color) {
        this.currentWheelColor = color;

        // Met à jour le color picker
        const wheelColorPicker = document.getElementById('wheel-color-picker');
        if (wheelColorPicker) {
            wheelColorPicker.value = color;
        }

        // Met à jour les preset colors
        document.querySelectorAll('[data-wheel-color]').forEach(opt => {
            opt.classList.remove('active');
        });
        const activePreset = document.querySelector(`[data-wheel-color="${color}"]`);
        if (activePreset) {
            activePreset.classList.add('active');
        }

        // Met à jour la catégorie Wheels Paint
        const wheelsPaintCategory = document.querySelector('[data-category="wheels-paint"]');
        if (wheelsPaintCategory) {
            const preview = wheelsPaintCategory.querySelector('.category-color-preview');
            if (preview) {
                preview.style.background = color;
            }
        }

        // Applique à Three.js (roues)
        if (this.experience?.world?.carsManager?.currentWheels) {
            // TODO: Ajouter une méthode setWheelColor dans WheelSet.js
            console.log('🎨 Wheel color:', color);
            // this.experience.world.carsManager.currentWheels.setColor(color);
        }
    }

    updateFinish(finish) {
        this.currentFinish = finish;
        
        if (this.experience?.world?.carsManager?.currentCar?.customizer) {
            this.experience.world.carsManager.currentCar.customizer.setFinish(finish);
            console.log('✨ Finish updated:', finish);
        }
    }
}