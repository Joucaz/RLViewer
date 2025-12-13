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

        // 🆕 État global actuel
        this.currentCar = 'octane';
        
        // 🆕 Mémoire des paramètres PAR VOITURE
        this.carStates = {
            fennec: {
                wheelType: 'dieci',
                paintColor: '#171617',
                wheelColor: '#1c1c1c',
                finish: 'anodized',
                hasCustomTexture: false
            },
            octane: {
                wheelType: 'dieci',
                paintColor: '#171617',
                wheelColor: '#1c1c1c',
                finish: 'anodized',
                hasCustomTexture: false
            },
            dominus: {
                wheelType: 'dieci',
                paintColor: '#171617',
                wheelColor: '#1c1c1c',
                finish: 'anodized',
                hasCustomTexture: false
            }
        };

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
            
            // 🆕 Restaure l'état initial de la voiture par défaut
            this.restoreCarState('octane');
        });
    }

    // 🆕 Sauvegarde l'état actuel de la voiture
    saveCurrentCarState() {
        const state = this.carStates[this.currentCar];
        // On ne sauvegarde pas car les valeurs sont déjà à jour dans updateXXX()
    }

    // 🆕 Restaure l'état d'une voiture dans l'UI
    restoreCarState(carType) {
        const state = this.carStates[carType];
        
        console.log(`🔄 Restoring state for ${carType}:`, state);
        
        // Restaure les roues
        this.restoreWheelUI(state.wheelType);
        
        // Restaure la couleur de paint
        this.restorePaintColorUI(state.paintColor);
        
        // Restaure la couleur de wheel
        this.restoreWheelColorUI(state.wheelColor);
        
        // Restaure le finish
        this.restoreFinishUI(state.finish);
        
        // Restaure la texture (affiche/cache le bouton reset)
        this.restoreTextureUI(state.hasCustomTexture);
    }

    // 🆕 Restaure l'UI des roues
    restoreWheelUI(wheelType) {
        const wheelCategory = document.querySelector('[data-category="wheels"]');
        wheelCategory.querySelector('.category-thumbnail').src = this.wheelConfig[wheelType].thumbnail;
        wheelCategory.querySelector('.category-thumbnail').alt = this.wheelConfig[wheelType].name;
        wheelCategory.querySelector('.category-name').textContent = this.wheelConfig[wheelType].name;

        document.querySelectorAll('[data-wheel]').forEach(item => {
            item.classList.remove('active');
        });
        const activeWheel = document.querySelector(`[data-wheel="${wheelType}"]`);
        if (activeWheel) activeWheel.classList.add('active');
    }

    // 🆕 Restaure l'UI de la couleur de paint
    restorePaintColorUI(color) {
        const colorPicker = document.getElementById('paint-color-picker');
        if (colorPicker) colorPicker.value = color;

        document.querySelectorAll('[data-color]').forEach(opt => {
            opt.classList.remove('active');
        });
        const activePreset = document.querySelector(`[data-color="${color}"]`);
        if (activePreset) activePreset.classList.add('active');

        const paintCategory = document.querySelector('[data-category="paint"]');
        if (paintCategory) {
            let preview = paintCategory.querySelector('.category-color-preview');
            if (!preview) {
                // Crée le preview s'il n'existe pas
                preview = document.createElement('div');
                preview.className = 'category-color-preview';
                const existingContent = paintCategory.querySelector('span');
                if (existingContent) {
                    paintCategory.removeChild(existingContent);
                }
                paintCategory.insertBefore(preview, paintCategory.firstChild);
            }
            preview.style.background = color;
        }
    }

    // 🆕 Restaure l'UI de la couleur de wheel
    restoreWheelColorUI(color) {
        const wheelColorPicker = document.getElementById('wheel-color-picker');
        if (wheelColorPicker) wheelColorPicker.value = color;

        document.querySelectorAll('[data-wheel-color]').forEach(opt => {
            opt.classList.remove('active');
        });
        const activePreset = document.querySelector(`[data-wheel-color="${color}"]`);
        if (activePreset) activePreset.classList.add('active');

        const wheelsPaintCategory = document.querySelector('[data-category="wheels-paint"]');
        if (wheelsPaintCategory) {
            let preview = wheelsPaintCategory.querySelector('.category-color-preview');
            if (!preview) {
                preview = document.createElement('div');
                preview.className = 'category-color-preview';
                const existingContent = wheelsPaintCategory.querySelector('span');
                if (existingContent) {
                    wheelsPaintCategory.removeChild(existingContent);
                }
                wheelsPaintCategory.insertBefore(preview, wheelsPaintCategory.firstChild);
            }
            preview.style.background = color;
        }
    }

    // 🆕 Restaure l'UI du finish
    restoreFinishUI(finish) {
        const finishSelect = document.getElementById('finish-select');
        if (finishSelect) finishSelect.value = finish;
    }

    // 🆕 Restaure l'UI de la texture
    restoreTextureUI(hasCustomTexture) {
        const resetBtn = document.getElementById('reset-texture');
        const texturePreview = document.getElementById('texture-preview');
        const texturePreviewImg = document.getElementById('texture-preview-img');
        
        if (hasCustomTexture) {
            // Affiche le bouton reset
            if (resetBtn) resetBtn.style.display = 'block';
            
            // ✅ Vérifie si une texture custom existe dans le storage
            const customTextureManager = this.experience?.world?.carsManager?.customTextureManager;
            if (customTextureManager) {
                const texture = customTextureManager.getTexture(this.currentCar);
                if (texture && texture.image) {
                    // Affiche la preview
                    if (texturePreviewImg) texturePreviewImg.src = texture.image.src;
                    if (texturePreview) texturePreview.style.display = 'block';
                }
            }
        } else {
            // Cache tout
            if (resetBtn) resetBtn.style.display = 'none';
            if (texturePreview) texturePreview.style.display = 'none';
            if (texturePreviewImg) texturePreviewImg.src = '';
        }
    }

    setupCategoryHover() {
        const categoryItems = document.querySelectorAll('.category-item');
        const panelContents = document.querySelectorAll('.panel-content');
        const selectionPanel = document.getElementById('selection-panel');

        categoryItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const category = item.dataset.category;
                
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
        document.querySelectorAll('[data-color]').forEach(colorBtn => {
            colorBtn.addEventListener('click', () => {
                const color = colorBtn.dataset.color;
                this.updatePaintColor(color);
            });
        });

        const colorPicker = document.getElementById('paint-color-picker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                this.updatePaintColor(e.target.value);
            });
        }
    }

    setupWheelPaintSelection() {
        document.querySelectorAll('[data-wheel-color]').forEach(colorBtn => {
            colorBtn.addEventListener('click', () => {
                const color = colorBtn.dataset.wheelColor;
                this.updateWheelColor(color);
            });
        });

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
                
                // 🆕 Sauvegarde dans l'état
                this.carStates[this.currentCar].hasCustomTexture = true;
                
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
            
            // 🆕 Sauvegarde dans l'état
            this.carStates[this.currentCar].hasCustomTexture = false;
            
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
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle) {
            musicToggle.addEventListener('change', (e) => {
                console.log('🎵 Music:', e.target.checked ? 'ON' : 'OFF');
            });
        }

        const rotationToggle = document.getElementById('rotation-toggle');
        if (rotationToggle) {
            rotationToggle.addEventListener('change', (e) => {
                if (this.experience?.camera?.controls) {
                    this.experience.camera.controls.autoRotate = e.target.checked;
                    console.log('🔄 Auto rotation:', e.target.checked ? 'ON' : 'OFF');
                }
            });
        }

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
        if (newCar === this.currentCar) return;
        
        console.log(`🚗 Switching from ${this.currentCar} to ${newCar}`);
        
        // Change la voiture actuelle
        this.currentCar = newCar;

        // Met à jour la catégorie Car
        const carCategory = document.querySelector('[data-category="car"]');
        carCategory.querySelector('.category-thumbnail').src = this.carConfig[newCar].thumbnail;
        carCategory.querySelector('.category-thumbnail').alt = this.carConfig[newCar].name;
        carCategory.querySelector('.category-name').textContent = this.carConfig[newCar].name;

        document.querySelectorAll('[data-car]').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-car="${newCar}"]`).classList.add('active');

        // 🆕 Restaure l'état de la nouvelle voiture AVANT de switch
        this.restoreCarState(newCar);

        // Switch dans Three.js avec l'état restauré
        if (this.experience?.world?.carsManager) {
            const state = this.carStates[newCar];
            this.experience.world.carsManager.switchCar(newCar, state.wheelType);
            
            // Applique les paramètres sauvegardés
            setTimeout(() => {
                if (this.experience.world.carsManager.currentCar) {
                    this.experience.world.carsManager.currentCar.setPaintColor(state.paintColor);
                    this.experience.world.carsManager.currentCar.setFinish(state.finish);
                }
                if (this.experience.world.carsManager.currentWheels) {
                    this.experience.world.carsManager.currentWheels.setColor(state.wheelColor);
                }
            }, 100);
        }
    }

    updateWheelSelection(newWheel) {
        const state = this.carStates[this.currentCar];
        if (newWheel === state.wheelType) return;
        
        // 🆕 Sauvegarde dans l'état
        state.wheelType = newWheel;

        this.restoreWheelUI(newWheel);

        if (this.experience?.world?.carsManager) {
            this.experience.world.carsManager.switchWheels(newWheel);
            
            // Réapplique la couleur des roues
            setTimeout(() => {
                if (this.experience.world.carsManager.currentWheels) {
                    this.experience.world.carsManager.currentWheels.setColor(state.wheelColor);
                }
            }, 100);
        }
    }

    updatePaintColor(color) {
        // 🆕 Sauvegarde dans l'état
        this.carStates[this.currentCar].paintColor = color;

        this.restorePaintColorUI(color);

        if (this.experience?.world?.carsManager?.currentCar) {
            this.experience.world.carsManager.currentCar.setPaintColor(color);
        }
    }

    updateWheelColor(color) {
        // 🆕 Sauvegarde dans l'état
        this.carStates[this.currentCar].wheelColor = color;

        this.restoreWheelColorUI(color);

        if (this.experience?.world?.carsManager?.currentWheels) {
            this.experience.world.carsManager.currentWheels.setColor(color);
        }
    }

    updateFinish(finish) {
        // 🆕 Sauvegarde dans l'état
        this.carStates[this.currentCar].finish = finish;
        
        this.restoreFinishUI(finish);
        
        if (this.experience?.world?.carsManager?.currentCar?.customizer) {
            this.experience.world.carsManager.currentCar.customizer.setFinish(finish);
            console.log('✨ Finish updated:', finish);
        }
    }
}