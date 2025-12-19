// src/ui.js - Version modifiée avec passage d'état aux méthodes switch

import * as THREE from 'three'
import Experience from "./Experience/Experience";
import { generateCodeFromState, BODY, WHEELS, DECAL } from './Experience/Utils/BakkesModGenerator.js';

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
            dieci: { name: 'Dieci', thumbnail: 'images/thumbnails/wheels/DieciThumbnail.png' },
            urus: { name: 'Urus', thumbnail: 'images/thumbnails/wheels/UrusThumbnail.png' },
            skyline: { name: 'Skyline', thumbnail: 'images/thumbnails/wheels/SkylineThumbnail.png' },
        };

        this.currentCar = 'octane';
        
        this.presetTexturesConfig = {
            fennec: [
                { name: 'fennecPreset1', path: 'textures/cars/fennec/presets/FennecM8.png' },
                { name: 'fennecPreset2', path: 'textures/cars/fennec/presets/FennecBDS.png' },
                { name: 'fennecPreset3', path: 'textures/cars/fennec/presets/FennecFuria.png' },
                { name: 'fennecPreset4', path: 'textures/cars/fennec/presets/FennecComplexity.png' }
            ],
            octane: [
                { name: 'octanePreset1', path: 'textures/cars/octane/presets/preset1.jpg' },
                { name: 'octanePreset2', path: 'textures/cars/octane/presets/preset2.jpg' },
                { name: 'octanePreset3', path: 'textures/cars/octane/presets/preset3.jpg' },
                { name: 'octanePreset4', path: 'textures/cars/octane/presets/preset4.jpg' }
            ],
            dominus: [
                { name: 'dominusPreset1', path: 'textures/cars/dominus/presets/preset1.jpg' },
                { name: 'dominusPreset2', path: 'textures/cars/dominus/presets/preset2.jpg' },
                { name: 'dominusPreset3', path: 'textures/cars/dominus/presets/preset3.jpg' },
                { name: 'dominusPreset4', path: 'textures/cars/dominus/presets/preset4.jpg' }
            ]
        };

        this.carStates = {
            fennec: {
                wheelType: 'dieci',
                paintColor: '#171617',
                wheelColor: '#171617',
                finish: 'anodized',
                hasCustomTexture: false,
                selectedPresetTexture: 'fennecPreset1'
            },
            octane: {
                wheelType: 'dieci',
                paintColor: '#171617',
                wheelColor: '#171617',
                finish: 'anodized',
                hasCustomTexture: false,
                selectedPresetTexture: 'octanePreset1'
            },
            dominus: {
                wheelType: 'dieci',
                paintColor: '#171617',
                wheelColor: '#171617',
                finish: 'anodized',
                hasCustomTexture: false,
                selectedPresetTexture: 'dominusPreset1'
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
            this.updatePresetTexturesGallery();
            this.setupPresetTextureSelection();
            this.setupTextureUpload();
            this.setupPlayAnimationButton();
            this.setupSaveAnimationButton();
            this.setupSaveImageButton();
            this.setupSettings();
            this.setupBakkesModButton(); 
            
            this.restoreCarState('octane');
        });
    }

    saveCurrentCarState() {
        const state = this.carStates[this.currentCar];
    }

    restoreCarState(carType) {
        const state = this.carStates[carType];
        
        console.log(`🔄 Restoring UI state for ${carType}:`, state);
        
        this.restoreWheelUI(state.wheelType);
        this.restorePaintColorUI(state.paintColor);
        this.restoreWheelColorUI(state.wheelColor);
        this.restoreFinishUI(state.finish);
        this.updatePresetTexturesGallery(); // Met à jour la galerie pour cette voiture
        this.restorePresetTextureUI(carType);
        this.restoreTextureUI(state.hasCustomTexture);
    }

    restoreWheelUI(wheelType) {
        const wheelCategory = document.querySelector('[data-category="wheels"]');
        if (!wheelCategory) return;
        
        const thumbnail = wheelCategory.querySelector('.category-thumbnail');
        if (thumbnail && this.wheelConfig[wheelType]) {
            thumbnail.src = this.wheelConfig[wheelType].thumbnail;
            thumbnail.alt = this.wheelConfig[wheelType].name;
        }
        
        const categoryName = wheelCategory.querySelector('.category-name');
        if (categoryName && this.wheelConfig[wheelType]) {
            categoryName.textContent = this.wheelConfig[wheelType].name;
        }

        document.querySelectorAll('[data-wheel]').forEach(item => {
            item.classList.remove('active');
        });
        const activeWheel = document.querySelector(`[data-wheel="${wheelType}"]`);
        if (activeWheel) activeWheel.classList.add('active');
    }

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
            if (preview) {
                preview.style.background = color;
            }
        }
    }

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
            if (preview) {
                preview.style.background = color;
            }
        }
    }

    restoreFinishUI(finish) {
        const finishSelect = document.getElementById('finish-select');
        if (finishSelect) finishSelect.value = finish;
    }

    restoreTextureUI(hasCustomTexture) {
        const resetBtn = document.getElementById('reset-texture');
        const texturePreview = document.getElementById('texture-preview');
        const texturePreviewImg = document.getElementById('texture-preview-img');
        
        if (hasCustomTexture) {
            if (resetBtn) resetBtn.style.display = 'block';
            
            const customTextureManager = this.experience?.world?.carsManager?.customTextureManager;
            if (customTextureManager) {
                const texture = customTextureManager.getTexture(this.currentCar);
                if (texture && texture.image) {
                    if (texturePreviewImg) texturePreviewImg.src = texture.image.src;
                    if (texturePreview) texturePreview.style.display = 'block';
                }
            }
        } else {
            if (resetBtn) resetBtn.style.display = 'none';
            if (texturePreview) texturePreview.style.display = 'none';
            if (texturePreviewImg) texturePreviewImg.src = '';
        }
    }

    // Restaure la texture preset dans l'UI
    restorePresetTextureUI(carType) {
        const selectedTexture = this.carStates[carType].selectedPresetTexture;
        
        // Met à jour l'UI pour marquer la texture sélectionnée
        document.querySelectorAll('[data-preset-texture]').forEach(opt => {
            opt.classList.remove('active');
        });
        const activeTexture = document.querySelector(`[data-preset-texture="${selectedTexture}"]`);
        if (activeTexture) activeTexture.classList.add('active');
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

    setupPresetTextureSelection() {
        // Les event listeners sont ajoutés dans updatePresetTexturesGallery()
    }

    // Génère la galerie de textures pour la voiture actuelle
    updatePresetTexturesGallery() {
        const gallery = document.getElementById('preset-textures-gallery');
        if (!gallery) return;
        
        // Vide la galerie
        gallery.innerHTML = '';
        
        // Récupère les textures pour la voiture actuelle
        const presets = this.presetTexturesConfig[this.currentCar];
        if (!presets) {
            console.error(`No preset textures for ${this.currentCar}`);
            return;
        }
        
        // Crée les éléments
        presets.forEach((preset, index) => {
            const option = document.createElement('div');
            option.className = 'texture-option';
            option.dataset.presetTexture = preset.name;
            
            // Active la texture sauvegardée
            if (preset.name === this.carStates[this.currentCar].selectedPresetTexture) {
                option.classList.add('active');
            }
            
            const img = document.createElement('img');
            img.src = preset.path;
            img.alt = `Preset ${index + 1}`;
            
            option.appendChild(img);
            gallery.appendChild(option);
            
            // Event listener
            option.addEventListener('click', () => {
                this.updatePresetTexture(preset.name);
            });
        });
        
        console.log(`✅ Preset textures gallery updated for ${this.currentCar}`);
    }

    updatePresetTexture(textureName) {
        console.log(`🎨 Applying preset texture: ${textureName}`);
        
        // Sauvegarde dans l'état
        this.carStates[this.currentCar].selectedPresetTexture = textureName;
        this.carStates[this.currentCar].hasCustomTexture = false;
        
        // Met à jour l'UI - retire active de tous
        document.querySelectorAll('[data-preset-texture]').forEach(opt => {
            opt.classList.remove('active');
        });
        
        // Ajoute active sur celui sélectionné
        const activeTexture = document.querySelector(`[data-preset-texture="${textureName}"]`);
        if (activeTexture) activeTexture.classList.add('active');
        
        // Applique la texture à la voiture
        if (this.experience?.resources?.items && this.experience?.world?.carsManager?.currentCar?.customizer) {
            const texture = this.experience.resources.items[textureName];
            
            if (texture) {
                // Configure la texture
                texture.flipY = false;
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.needsUpdate = true;
                
                // Applique au customizer
                this.experience.world.carsManager.currentCar.customizer.applyCustomTexture(texture);
                
                // Cache la preview d'upload et le bouton reset
                const texturePreview = document.getElementById('texture-preview');
                const resetBtn = document.getElementById('reset-texture');
                if (texturePreview) texturePreview.style.display = 'none';
                if (resetBtn) resetBtn.style.display = 'none';
                
                console.log(`✅ Preset texture ${textureName} applied!`);
            } else {
                console.error(`❌ Texture ${textureName} not found in resources!`);
            }
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
                
                this.carStates[this.currentCar].hasCustomTexture = true;
                
                // Désactive la sélection des presets
                document.querySelectorAll('[data-preset-texture]').forEach(opt => {
                    opt.classList.remove('active');
                });
                
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
            if(this.currentCar && this.experience?.world?.carsManager?.currentCar?.customizer) {
                texturePreview.style.display = 'none';
                texturePreviewImg.src = '';
                resetBtn.style.display = 'none';
                
                // Réinitialise à preset1
                const preset1Name = `${this.currentCar}Preset1`;
                this.carStates[this.currentCar].hasCustomTexture = false;
                this.carStates[this.currentCar].selectedPresetTexture = preset1Name;
                
                // Applique preset1
                this.updatePresetTexture(preset1Name);
                
                // Supprime la custom texture du storage
                const customTextureManager = this.experience.world.carsManager.customTextureManager;
                customTextureManager.removeTexture(this.currentCar);
                
                console.log(`✅ Texture reset to preset1 for ${this.currentCar}`);
            }
        });
    }

    // Bouton Play Animation
    setupPlayAnimationButton() {
        const playBtn = document.getElementById('play-animation-btn');
        if (playBtn) {
            playBtn.addEventListener('click', async () => {
                console.log('🎬 Play animation clicked!');
                
                if (this.experience?.world?.carsManager) {
                    try {
                        // Désactive le bouton pendant l'animation
                        playBtn.style.opacity = '0.5';
                        playBtn.style.pointerEvents = 'none';
                        
                        // Lance l'animation
                        await this.experience.world.carsManager.playEntryAnimation();
                        
                        // Réactive le bouton
                        playBtn.style.opacity = '1';
                        playBtn.style.pointerEvents = 'all';
                        
                        console.log('✅ Animation completed!');
                    } catch (error) {
                        console.error('❌ Animation error:', error);
                        playBtn.style.opacity = '1';
                        playBtn.style.pointerEvents = 'all';
                    }
                } else {
                    alert('Car manager not ready yet!');
                }
            });
        }
    }

    // Bouton Save Animation
    setupSaveAnimationButton() {
        const saveAnimBtn = document.getElementById('save-animation-btn');
        const saveAnimText = document.getElementById('save-animation-text');
        
        if (saveAnimBtn) {
            let isRecording = false;
            
            saveAnimBtn.addEventListener('click', async () => {
                if (!this.experience?.world?.carsManager?.animator?.captureManager) {
                    console.error('❌ CaptureManager not available!');
                    alert('CaptureManager not initialized!');
                    return;
                }
                
                const captureManager = this.experience.world.carsManager.animator.captureManager;
                
                if (!isRecording) {
                    console.log('🎥 Save animation clicked - recording...');
                    
                    try {
                        // Démarre l'enregistrement et l'animation
                        const success = await captureManager.recordAnimation(async () => {
                            return this.experience.world.carsManager.playEntryAnimation();
                        });
                        
                        if (success) {
                            console.log('✅ Animation saved!');
                        }
                    } catch (error) {
                        console.error('❌ Error saving animation:', error);
                        alert('Failed to save animation!');
                    }
                } else {
                    // Stop recording (au cas où)
                    captureManager.stopRecording();
                    isRecording = false;
                    saveAnimText.textContent = 'Save Animation';
                    saveAnimBtn.style.opacity = '1';
                }
            });
        }
    }

    // Bouton Save Image
    setupSaveImageButton() {
        const saveImgBtn = document.getElementById('save-image-btn');
        if (saveImgBtn) {
            saveImgBtn.addEventListener('click', async () => {
                console.log('📸 Save image clicked!');
                
                if (!this.experience?.world?.carsManager?.animator?.captureManager) {
                    console.error('❌ CaptureManager not available!');
                    alert('CaptureManager not initialized!');
                    return;
                }
                
                const captureManager = this.experience.world.carsManager.animator.captureManager;
                
                try {
                    // Désactive le bouton pendant la capture
                    saveImgBtn.style.opacity = '0.5';
                    saveImgBtn.style.pointerEvents = 'none';
                    
                    // Capture l'image
                    await captureManager.captureImage();
                    
                    // Réactive le bouton
                    saveImgBtn.style.opacity = '1';
                    saveImgBtn.style.pointerEvents = 'all';
                    
                    console.log('✅ Image saved!');
                } catch (error) {
                    console.error('❌ Image capture failed:', error);
                    alert('Failed to save image!');
                    
                    saveImgBtn.style.opacity = '1';
                    saveImgBtn.style.pointerEvents = 'all';
                }
            });
        }
    }

    // Bouton BakkesMod
    setupBakkesModButton() {
        const bakkesBtn = document.getElementById('bakkesmod-btn');
        const resultDiv = document.getElementById('bakkesmod-result');
        const codeInput = document.getElementById('bakkesmod-code');
        const copyBtn = document.getElementById('copy-code-btn');
        
        if (!bakkesBtn || !resultDiv || !codeInput || !copyBtn) {
            console.warn('⚠️ BakkesMod elements not found');
            return;
        }
        
        bakkesBtn.addEventListener('click', () => {
            console.log('🎮 Generating BakkesMod code...');
            
            // Récupère l'état actuel
            const carState = this.carStates[this.currentCar];
            
            // Génère le code
            const code = generateCodeFromState(carState, this.currentCar);
            
            console.log('📋 Generated code:', code);
            console.log('   Car:', this.currentCar);
            console.log('   Wheels:', carState.wheelType);
            console.log('   Texture:', carState.selectedPresetTexture);
            console.log('   Wheel Color:', carState.wheelColor);
            
            // Affiche le résultat
            codeInput.value = code;
            resultDiv.style.display = 'block';
            
            // Copie automatiquement dans le presse-papiers
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.textContent = '✅';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.textContent = '📋';
                    copyBtn.classList.remove('copied');
                }, 2000);
                
                console.log('✅ Code copied to clipboard!');
            }).catch(err => {
                console.error('❌ Failed to copy:', err);
            });
        });
        
        // Bouton de copie manuel
        copyBtn.addEventListener('click', () => {
            const code = codeInput.value;
            if (!code) return;
            
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.textContent = '✅';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.textContent = '📋';
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
        });
        
        // Permet de sélectionner tout le texte au clic
        codeInput.addEventListener('click', () => {
            codeInput.select();
        });
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

    // 🆕 MODIFIÉ - Passe l'état sauvegardé lors du switch de voiture
    updateCarSelection(newCar) {
        if (newCar === this.currentCar) return;
        
        console.log(`🚗 Switching from ${this.currentCar} to ${newCar}`);
        
        this.currentCar = newCar;

        // Met à jour la thumbnail de la catégorie
        const carCategory = document.querySelector('[data-category="car"]');
        if (carCategory) {
            const thumbnail = carCategory.querySelector('.category-thumbnail');
            if (thumbnail && this.carConfig[newCar]) {
                thumbnail.src = this.carConfig[newCar].thumbnail;
                thumbnail.alt = this.carConfig[newCar].name;
            }
            
            const categoryName = carCategory.querySelector('.category-name');
            if (categoryName && this.carConfig[newCar]) {
                categoryName.textContent = this.carConfig[newCar].name;
            }
        }

        // Met à jour les boutons actifs
        document.querySelectorAll('[data-car]').forEach(item => {
            item.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-car="${newCar}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Restaure l'UI pour cette voiture
        this.restoreCarState(newCar);

        // 🆕 Passe l'état sauvegardé au CarsManager
        if (this.experience?.world?.carsManager) {
            const state = this.carStates[newCar];
            this.experience.world.carsManager.switchCar(newCar, state.wheelType, state);
        }
    }

    // 🆕 MODIFIÉ - Passe l'état sauvegardé lors du switch de roues
    updateWheelSelection(newWheel) {
        const state = this.carStates[this.currentCar];
        if (newWheel === state.wheelType) return;
        
        console.log(`🛞 Switching wheels from ${state.wheelType} to ${newWheel}`);
        
        // Sauvegarde le nouveau type de roue dans l'état
        state.wheelType = newWheel;
        
        // Met à jour l'UI
        this.restoreWheelUI(newWheel);

        // 🆕 Passe l'état COMPLET au CarsManager pour préserver paint, texture, etc.
        if (this.experience?.world?.carsManager) {
            this.experience.world.carsManager.switchWheels(newWheel, state);
        }
    }

    updatePaintColor(color) {
        this.carStates[this.currentCar].paintColor = color;
        this.restorePaintColorUI(color);

        if (this.experience?.world?.carsManager?.currentCar) {
            this.experience.world.carsManager.currentCar.setPaintColor(color);
        }
    }

    updateWheelColor(color) {
        this.carStates[this.currentCar].wheelColor = color;
        this.restoreWheelColorUI(color);

        if (this.experience?.world?.carsManager?.currentWheels) {
            this.experience.world.carsManager.currentWheels.setColor(color);
        }
    }

    updateFinish(finish) {
        this.carStates[this.currentCar].finish = finish;
        this.restoreFinishUI(finish);
        
        if (this.experience?.world?.carsManager?.currentCar?.customizer) {
            this.experience.world.carsManager.currentCar.customizer.setFinish(finish);
            console.log('✨ Finish updated:', finish);
        }
    }
}