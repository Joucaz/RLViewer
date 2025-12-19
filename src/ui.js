// src/ui.js - Version corrigée avec gestion des textures custom et couleurs

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
                {
                    name: 'fennecPreset1',
                    path: 'textures/cars/fennec/presets/FennecM8.png',
                    thumbnail: 'textures/cars/fennec/thumbnails/FennecM8_thumb.png'
                },
                {
                    name: 'fennecPreset2',
                    path: 'textures/cars/fennec/presets/FennecKarmine.png',
                    thumbnail: 'textures/cars/fennec/thumbnails/FennecKarmine_thumb.png'
                },
                {
                    name: 'fennecPreset3',
                    path: 'textures/cars/fennec/presets/FennecGiants.png',
                    thumbnail: 'textures/cars/fennec/thumbnails/FennecGiants_thumb.png'
                },
                {
                    name: 'fennecPreset4',
                    path: 'textures/cars/fennec/presets/FennecFuria.png',
                    thumbnail: 'textures/cars/fennec/thumbnails/FennecFuria_thumb.png'
                }
            ],
            octane: [
                {
                    name: 'octanePreset1',
                    path: 'textures/cars/octane/presets/OctaneG2.png',
                    thumbnail: 'textures/cars/octane/thumbnails/OctaneG2_thumb.png'
                },
                {
                    name: 'octanePreset2',
                    path: 'textures/cars/octane/presets/OctaneElevate.png',
                    thumbnail: 'textures/cars/octane/thumbnails/OctaneElevate_thumb.png'
                },
                {
                    name: 'octanePreset3',
                    path: 'textures/cars/octane/presets/OctaneBDS.png',
                    thumbnail: 'textures/cars/octane/thumbnails/OctaneBDS_thumb.png'
                },
                {
                    name: 'octanePreset4',
                    path: 'textures/cars/octane/presets/OctaneNikeYellow.png',
                    thumbnail: 'textures/cars/octane/thumbnails/OctaneNikeYellow_thumb.png'
                }
            ],
            dominus: [
                {
                    name: 'dominusPreset1',
                    path: 'textures/cars/dominus/presets/DominusG2.png',
                    thumbnail: 'textures/cars/dominus/thumbnails/DominusG2_thumb.png'
                },
                {
                    name: 'dominusPreset2',
                    path: 'textures/cars/dominus/presets/DominusV1.png',
                    thumbnail: 'textures/cars/dominus/thumbnails/DominusV1_thumb.png'
                },
                {
                    name: 'dominusPreset3',
                    path: 'textures/cars/dominus/presets/DominusSolary.png',
                    thumbnail: 'textures/cars/dominus/thumbnails/DominusSolary_thumb.png'
                },
                {
                    name: 'dominusPreset4',
                    path: 'textures/cars/dominus/presets/DominusBDS.png',
                    thumbnail: 'textures/cars/dominus/thumbnails/DominusBDS_thumb.png'
                }
            ]
        };


        this.carStates = {
            fennec: {
                wheelType: 'dieci',
                paintColor: '#171617',
                wheelColor: '#171617',
                finish: 'anodized',
                hasCustomTexture: false,
                selectedPresetTexture: 'fennecPreset1',
                customTextureDataURL: null // 🆕 Stocke le dataURL de la texture custom
            },
            octane: {
                wheelType: 'dieci',
                paintColor: '#171617',
                wheelColor: '#171617',
                finish: 'anodized',
                hasCustomTexture: false,
                selectedPresetTexture: 'octanePreset1',
                customTextureDataURL: null
            },
            dominus: {
                wheelType: 'dieci',
                paintColor: '#171617',
                wheelColor: '#171617',
                finish: 'anodized',
                hasCustomTexture: false,
                selectedPresetTexture: 'dominusPreset1',
                customTextureDataURL: null
            }
        };

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            // 🆕 Charge les états sauvegardés depuis sessionStorage
            this.loadStatesFromStorage();
            
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

    // 🆕 Charge les états depuis sessionStorage au démarrage
    loadStatesFromStorage() {
        try {
            const savedStates = sessionStorage.getItem('rl_car_states');
            if (savedStates) {
                const parsed = JSON.parse(savedStates);
                // Merge avec les états par défaut
                Object.keys(this.carStates).forEach(carType => {
                    if (parsed[carType]) {
                        this.carStates[carType] = { ...this.carStates[carType], ...parsed[carType] };
                    }
                });
                console.log('✅ Car states loaded from storage');
            }
        } catch (error) {
            console.warn('⚠️ Error loading states from storage:', error);
        }
    }

    // 🆕 Sauvegarde les états dans sessionStorage
    saveStatesToStorage() {
        try {
            sessionStorage.setItem('rl_car_states', JSON.stringify(this.carStates));
        } catch (error) {
            console.warn('⚠️ Error saving states to storage:', error);
        }
    }

    saveCurrentCarState() {
        const state = this.carStates[this.currentCar];
        this.saveStatesToStorage(); // 🆕 Sauvegarde aussi dans sessionStorage
    }

    restoreCarState(carType) {
        const state = this.carStates[carType];
        
        console.log(`🔄 Restoring UI state for ${carType}:`, state);
        
        this.restoreWheelUI(state.wheelType);
        this.restorePaintColorUI(state.paintColor);
        this.restoreWheelColorUI(state.wheelColor);
        this.restoreFinishUI(state.finish);
        this.updatePresetTexturesGallery();
        this.restorePresetTextureUI(carType);
        this.restoreTextureUI(state.hasCustomTexture, state.customTextureDataURL); // 🆕 Passe le dataURL
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

        // 🆕 Retire active de TOUTES les couleurs paint d'abord
        document.querySelectorAll('[data-panel="paint"] [data-color]').forEach(opt => {
            opt.classList.remove('active');
        });
        
        // 🆕 Ajoute active sur la couleur correspondante
        const activePreset = document.querySelector(`[data-panel="paint"] [data-color="${color}"]`);
        if (activePreset) {
            activePreset.classList.add('active');
        }

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

        // 🆕 Retire active de TOUTES les couleurs wheel d'abord
        document.querySelectorAll('[data-panel="wheels-paint"] [data-wheel-color]').forEach(opt => {
            opt.classList.remove('active');
        });
        
        // 🆕 Ajoute active sur la couleur correspondante
        const activePreset = document.querySelector(`[data-panel="wheels-paint"] [data-wheel-color="${color}"]`);
        if (activePreset) {
            activePreset.classList.add('active');
        }

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

    // 🆕 MODIFIÉ - Restaure l'UI de texture avec support du dataURL sauvegardé
    restoreTextureUI(hasCustomTexture, customTextureDataURL = null) {
        const resetBtn = document.getElementById('reset-texture');
        const texturePreview = document.getElementById('texture-preview');
        const texturePreviewImg = document.getElementById('texture-preview-img');
        
        if (hasCustomTexture) {
            if (resetBtn) resetBtn.style.display = 'block';
            
            // 🆕 Utilise le dataURL sauvegardé si disponible
            if (customTextureDataURL && texturePreviewImg && texturePreview) {
                texturePreviewImg.src = customTextureDataURL;
                texturePreview.style.display = 'block';
                console.log('✅ Custom texture preview restored from saved dataURL');
            } else {
                // Fallback: essaye de récupérer depuis le TextureStorage
                const textureStorage = this.experience?.world?.carsManager?.textureStorage;
                if (textureStorage) {
                    const savedDataURL = textureStorage.getTexture(this.currentCar);
                    if (savedDataURL && texturePreviewImg && texturePreview) {
                        texturePreviewImg.src = savedDataURL;
                        texturePreview.style.display = 'block';
                        // 🆕 Sauvegarde aussi dans l'état
                        this.carStates[this.currentCar].customTextureDataURL = savedDataURL;
                        console.log('✅ Custom texture preview restored from TextureStorage');
                    }
                }
            }
            
            // 🆕 Retire le check des presets quand texture custom active
            document.querySelectorAll('[data-preset-texture]').forEach(opt => {
                opt.classList.remove('active');
            });
        } else {
            if (resetBtn) resetBtn.style.display = 'none';
            if (texturePreview) texturePreview.style.display = 'none';
            if (texturePreviewImg) texturePreviewImg.src = '';
        }
    }

    // 🆕 MODIFIÉ - Restaure la texture preset dans l'UI (seulement si pas de custom)
    restorePresetTextureUI(carType) {
        const state = this.carStates[carType];
        
        // 🆕 Ne montre pas de check si texture custom active
        if (state.hasCustomTexture) {
            document.querySelectorAll('[data-preset-texture]').forEach(opt => {
                opt.classList.remove('active');
            });
            return;
        }
        
        const selectedTexture = state.selectedPresetTexture;
        
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
        // 🆕 Sélectionne uniquement les couleurs dans le panel paint
        document.querySelectorAll('[data-panel="paint"] [data-color]').forEach(colorBtn => {
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
        // 🆕 Sélectionne uniquement les couleurs dans le panel wheels-paint
        document.querySelectorAll('[data-panel="wheels-paint"] [data-wheel-color]').forEach(colorBtn => {
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

    updatePresetTexturesGallery() {
        const gallery = document.getElementById('preset-textures-gallery');
        if (!gallery) return;
        
        gallery.innerHTML = '';
        
        const presets = this.presetTexturesConfig[this.currentCar];
        if (!presets) {
            console.error(`No preset textures for ${this.currentCar}`);
            return;
        }
        
        const state = this.carStates[this.currentCar];
        
        presets.forEach((preset, index) => {
            const option = document.createElement('div');
            option.className = 'texture-option';
            option.dataset.presetTexture = preset.name;
            
            // 🆕 N'ajoute active QUE si pas de custom texture
            if (!state.hasCustomTexture && preset.name === state.selectedPresetTexture) {
                option.classList.add('active');
            }
            
            const img = document.createElement('img');
            img.src = preset.thumbnail || preset.path;
            img.alt = `Preset ${index + 1}`;
            
            option.appendChild(img);
            gallery.appendChild(option);
            
            option.addEventListener('click', () => {
                this.updatePresetTexture(preset.name);
            });
        });
        
        console.log(`✅ Preset textures gallery updated for ${this.currentCar}`);
    }

    // 🆕 MODIFIÉ - Gère mieux le switch vers preset
    updatePresetTexture(textureName) {
        console.log(`🎨 Applying preset texture: ${textureName}`);
        
        const state = this.carStates[this.currentCar];
        
        // Sauvegarde dans l'état
        state.selectedPresetTexture = textureName;
        state.hasCustomTexture = false;
        state.customTextureDataURL = null; // 🆕 Clear le dataURL custom
        
        // 🆕 Sauvegarde dans sessionStorage
        this.saveStatesToStorage();
        
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
                texture.flipY = false;
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.needsUpdate = true;
                
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

    // 🆕 MODIFIÉ - Gère mieux l'upload de texture custom
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
                
                // 🆕 Sauvegarde le dataURL dans l'état
                this.carStates[this.currentCar].hasCustomTexture = true;
                this.carStates[this.currentCar].customTextureDataURL = dataURL;
                
                // 🆕 Sauvegarde dans sessionStorage
                this.saveStatesToStorage();
                
                // 🆕 Désactive la sélection des presets (retire le check)
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

        // 🆕 MODIFIÉ - Reset remet le check sur preset1
        resetBtn.addEventListener('click', () => {
            if(this.currentCar && this.experience?.world?.carsManager?.currentCar?.customizer) {
                texturePreview.style.display = 'none';
                texturePreviewImg.src = '';
                resetBtn.style.display = 'none';
                
                // Réinitialise à preset1
                const preset1Name = `${this.currentCar}Preset1`;
                this.carStates[this.currentCar].hasCustomTexture = false;
                this.carStates[this.currentCar].selectedPresetTexture = preset1Name;
                this.carStates[this.currentCar].customTextureDataURL = null; // 🆕 Clear le dataURL
                
                // 🆕 Sauvegarde dans sessionStorage
                this.saveStatesToStorage();
                
                // Applique preset1
                this.updatePresetTexture(preset1Name);
                
                // Supprime la custom texture du storage
                const customTextureManager = this.experience.world.carsManager.customTextureManager;
                customTextureManager.removeTexture(this.currentCar);
                
                console.log(`✅ Texture reset to preset1 for ${this.currentCar}`);
            }
        });
    }

    setupPlayAnimationButton() {
        const playBtn = document.getElementById('play-animation-btn');
        if (playBtn) {
            playBtn.addEventListener('click', async () => {
                console.log('🎬 Play animation clicked!');
                
                if (this.experience?.world?.carsManager) {
                    try {
                        playBtn.style.opacity = '0.5';
                        playBtn.style.pointerEvents = 'none';
                        
                        await this.experience.world.carsManager.playEntryAnimation();
                        
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
                    captureManager.stopRecording();
                    isRecording = false;
                    saveAnimText.textContent = 'Save Animation';
                    saveAnimBtn.style.opacity = '1';
                }
            });
        }
    }

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
                    saveImgBtn.style.opacity = '0.5';
                    saveImgBtn.style.pointerEvents = 'none';
                    
                    await captureManager.captureImage();
                    
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
            
            const carState = this.carStates[this.currentCar];
            const code = generateCodeFromState(carState, this.currentCar);
            
            console.log('📋 Generated code:', code);
            console.log('   Car:', this.currentCar);
            console.log('   Wheels:', carState.wheelType);
            console.log('   Texture:', carState.selectedPresetTexture);
            console.log('   Wheel Color:', carState.wheelColor);
            
            codeInput.value = code;
            resultDiv.style.display = 'block';
            
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
            // 🆕 Change les valeurs min/max/step pour un multiplicateur (0 à 2, avec 1 = 100%)
            lightIntensity.min = 0;
            lightIntensity.max = 3;
            lightIntensity.step = 0.1;
            lightIntensity.value = 1; // Valeur par défaut = 1 (100%)
            lightIntensityValue.textContent = '1.0';
            
            lightIntensity.addEventListener('input', (e) => {
                const multiplier = parseFloat(e.target.value);
                lightIntensityValue.textContent = multiplier.toFixed(1);
                
                // 🆕 Utilise la nouvelle méthode setLightMultiplier
                if (this.experience?.world?.environment) {
                    this.experience.world.environment.setLightMultiplier(multiplier);
                }
                
                console.log('💡 Light multiplier:', multiplier);
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
        
        // 🆕 Sauvegarde l'état actuel avant de changer
        this.saveStatesToStorage();
        
        this.currentCar = newCar;

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

        document.querySelectorAll('[data-car]').forEach(item => {
            item.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-car="${newCar}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        this.restoreCarState(newCar);

        if (this.experience?.world?.carsManager) {
            const state = this.carStates[newCar];
            this.experience.world.carsManager.switchCar(newCar, state.wheelType, state);
        }
    }

    updateWheelSelection(newWheel) {
        const state = this.carStates[this.currentCar];
        if (newWheel === state.wheelType) return;
        
        console.log(`🛞 Switching wheels from ${state.wheelType} to ${newWheel}`);
        
        state.wheelType = newWheel;
        
        // 🆕 Sauvegarde dans sessionStorage
        this.saveStatesToStorage();
        
        this.restoreWheelUI(newWheel);

        if (this.experience?.world?.carsManager) {
            this.experience.world.carsManager.switchWheels(newWheel, state);
        }
    }

    // 🆕 MODIFIÉ - Gère mieux la sélection des couleurs paint
    updatePaintColor(color) {
        this.carStates[this.currentCar].paintColor = color;
        
        // 🆕 Sauvegarde dans sessionStorage
        this.saveStatesToStorage();
        
        this.restorePaintColorUI(color);

        if (this.experience?.world?.carsManager?.currentCar) {
            this.experience.world.carsManager.currentCar.setPaintColor(color);
        }
    }

    // 🆕 MODIFIÉ - Gère mieux la sélection des couleurs wheel
    updateWheelColor(color) {
        this.carStates[this.currentCar].wheelColor = color;
        
        // 🆕 Sauvegarde dans sessionStorage
        this.saveStatesToStorage();
        
        this.restoreWheelColorUI(color);

        if (this.experience?.world?.carsManager?.currentWheels) {
            this.experience.world.carsManager.currentWheels.setColor(color);
        }
    }

    updateFinish(finish) {
        this.carStates[this.currentCar].finish = finish;
        
        // 🆕 Sauvegarde dans sessionStorage
        this.saveStatesToStorage();
        
        this.restoreFinishUI(finish);
        
        if (this.experience?.world?.carsManager?.currentCar?.customizer) {
            this.experience.world.carsManager.currentCar.customizer.setFinish(finish);
            console.log('✨ Finish updated:', finish);
        }
    }
}