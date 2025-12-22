// src/MobileUI.js - Gestionnaire d'UI mobile pour Rocket League Viewer

import Experience from './Experience/Experience.js'
import { generateCodeFromState } from './Experience/Utils/BakkesModGenerator.js'

export default class UIMobile {
    constructor(uiManager) {
        this.uiManager = uiManager
        this.experience = new Experience()
        
        this.isDrawerOpen = false
        this.currentTab = 'car'
        
        // Détecte si on est sur mobile
        this.isMobile = window.innerWidth <= 768
        
        if (this.isMobile) {
            this.init()
        }
        
        // Écoute les changements de taille d'écran
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile
            this.isMobile = window.innerWidth <= 768
            
            if (wasMobile !== this.isMobile) {
                if (this.isMobile) {
                    this.init()
                } else {
                    this.destroy()
                }
            }
        })
    }
    
    init() {
        console.log('📱 Initializing Mobile UI...')
        
        // Crée les éléments HTML si nécessaire
        this.createMobileElements()
        
        // Setup event listeners
        this.setupDrawerToggle()
        this.setupTabs()
        this.setupCarSelection()
        this.setupWheelSelection()
        this.setupPaintSelection()
        this.setupWheelPaintSelection()
        this.setupFinishSelection()
        this.setupTextureSelection()
        this.setupActions()
        this.setupSettings()
        
        // Restore state
        this.updateAllMobilePanels()
        
        console.log('✅ Mobile UI initialized')
    }
    
    createMobileElements() {
        // Vérifie si déjà créé
        if (document.querySelector('.mobile-customize-btn')) return
        
        const body = document.body
        
        // Bouton Customize
        const customizeBtn = document.createElement('button')
        customizeBtn.className = 'mobile-customize-btn'
        customizeBtn.textContent = 'Customize'
        body.appendChild(customizeBtn)
        
        // Drawer
        const drawer = document.createElement('div')
        drawer.className = 'mobile-drawer'
        drawer.innerHTML = this.getDrawerHTML()
        body.appendChild(drawer)
    }
    
    getDrawerHTML() {
        return `
            <!-- Handle -->
            <div class="drawer-handle">
                <div class="drawer-handle-bar"></div>
            </div>
            
            <!-- Tabs -->
            <div class="drawer-tabs">
                <div class="drawer-tab active" data-mobile-tab="car">Car</div>
                <div class="drawer-tab" data-mobile-tab="texture">Decal / Texture</div>
                <div class="drawer-tab" data-mobile-tab="finish">Finish</div>
                <div class="drawer-tab" data-mobile-tab="paint">Paint</div>
                <div class="drawer-tab" data-mobile-tab="wheels">Wheels</div>
                <div class="drawer-tab" data-mobile-tab="wheels-paint">Wheels Paint</div>
                <div class="drawer-tab" data-mobile-tab="export">Export</div>
                <div class="drawer-tab" data-mobile-tab="settings">Settings</div>
            </div>
            
            <!-- Content -->
            <div class="drawer-content">
                ${this.getCarPanelHTML()}
                ${this.getTexturePanelHTML()}
                ${this.getFinishPanelHTML()}
                ${this.getPaintPanelHTML()}
                ${this.getWheelsPanelHTML()}
                ${this.getWheelsPaintPanelHTML()}
                ${this.getExportPanelHTML()}
                ${this.getSettingsPanelHTML()}
            </div>
        `
    }
    
    getCarPanelHTML() {
        return `
            <div class="mobile-panel active" data-mobile-panel="car">
                <div class="mobile-section-title">SELECT CAR</div>
                <div class="mobile-options-grid">
                    <div class="mobile-option-card" data-mobile-car="fennec">
                        <img src="images/thumbnails/car/FennecThumbnail.png" alt="Fennec" class="mobile-option-image">
                        <div class="mobile-option-name">Fennec</div>
                    </div>
                    <div class="mobile-option-card active" data-mobile-car="octane">
                        <img src="images/thumbnails/car/OctaneThumbnail.png" alt="Octane" class="mobile-option-image">
                        <div class="mobile-option-name">Octane</div>
                    </div>
                    <div class="mobile-option-card" data-mobile-car="dominus">
                        <img src="images/thumbnails/car/DominusThumbnail.png" alt="Dominus" class="mobile-option-image">
                        <div class="mobile-option-name">Dominus</div>
                    </div>
                </div>
            </div>
        `
    }
    
    getTexturePanelHTML() {
        return `
            <div class="mobile-panel" data-mobile-panel="texture">
                <div class="mobile-section-title">PRESET TEXTURES</div>
                <div class="mobile-texture-grid" id="mobile-texture-grid">
                    <!-- Sera rempli dynamiquement -->
                </div>
                
                <div class="mobile-section-title">CUSTOM TEXTURE</div>
                <label for="mobile-texture-upload" class="mobile-upload-card">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>Upload Texture</span>
                    <small>PNG or JPG • Max 5MB</small>
                </label>
                <input type="file" id="mobile-texture-upload" accept="image/png,image/jpg,image/jpeg" style="display: none;">
            </div>
        `
    }
    
    getFinishPanelHTML() {
        return `
            <div class="mobile-panel" data-mobile-panel="finish">
                <div class="mobile-section-title">PAINT FINISH</div>
                <select class="mobile-dropdown" id="mobile-finish-select">
                    <option value="anodized" selected>Anodized</option>
                    <option value="matte">Matte</option>
                    <option value="metallic">Metallic</option>
                    <option value="glossy">Glossy</option>
                </select>
            </div>
        `
    }
    
    getPaintPanelHTML() {
        return `
            <div class="mobile-panel" data-mobile-panel="paint">
                <div class="mobile-section-title">PRESET COLORS</div>
                <div class="mobile-color-grid">
                    <div class="mobile-color-option active" style="background: #171617;" data-mobile-paint-color="#171617"></div>
                    <div class="mobile-color-option" style="background: #67655f;" data-mobile-paint-color="#67655f"></div>
                    <div class="mobile-color-option" style="background: #fffff0;" data-mobile-paint-color="#fffff0"></div>
                    <div class="mobile-color-option" style="background: #47d9e0;" data-mobile-paint-color="#47d9e0"></div>
                    <div class="mobile-color-option" style="background: #cdf032;" data-mobile-paint-color="#cdf032"></div>
                    <div class="mobile-color-option" style="background: #de2823;" data-mobile-paint-color="#de2823"></div>
                    <div class="mobile-color-option" style="background: #ff7300;" data-mobile-paint-color="#ff7300"></div>
                    <div class="mobile-color-option" style="background: #ff5cb6;" data-mobile-paint-color="#ff5cb6"></div>
                    <div class="mobile-color-option" style="background: #3b083f;" data-mobile-paint-color="#3b083f"></div>
                </div>
                
                <div class="mobile-color-picker-section">
                    <label class="mobile-color-picker-label">Custom Color</label>
                    <input type="color" class="mobile-color-picker-input" id="mobile-paint-picker" value="#171617">
                </div>
            </div>
        `
    }
    
    getWheelsPanelHTML() {
        return `
            <div class="mobile-panel" data-mobile-panel="wheels">
                <div class="mobile-section-title">SELECT WHEELS</div>
                <div class="mobile-options-grid">
                    <div class="mobile-option-card" data-mobile-wheel="alpha">
                        <img src="images/thumbnails/wheels/AlphaThumbnail.png" alt="Alpha" class="mobile-option-image">
                        <div class="mobile-option-name">Alpha</div>
                    </div>
                    <div class="mobile-option-card" data-mobile-wheel="cristiano">
                        <img src="images/thumbnails/wheels/CristianoThumbnail.png" alt="Cristiano" class="mobile-option-image">
                        <div class="mobile-option-name">Cristiano</div>
                    </div>
                    <div class="mobile-option-card active" data-mobile-wheel="dieci">
                        <img src="images/thumbnails/wheels/DieciThumbnail.png" alt="Dieci" class="mobile-option-image">
                        <div class="mobile-option-name">Dieci</div>
                    </div>
                    <div class="mobile-option-card" data-mobile-wheel="urus">
                        <img src="images/thumbnails/wheels/UrusThumbnail.png" alt="Urus" class="mobile-option-image">
                        <div class="mobile-option-name">Urus</div>
                    </div>
                    <div class="mobile-option-card" data-mobile-wheel="skyline">
                        <img src="images/thumbnails/wheels/SkylineThumbnail.png" alt="Skyline" class="mobile-option-image">
                        <div class="mobile-option-name">Skyline</div>
                    </div>
                </div>
            </div>
        `
    }
    
    getWheelsPaintPanelHTML() {
        return `
            <div class="mobile-panel" data-mobile-panel="wheels-paint">
                <div class="mobile-section-title">PRESET COLORS</div>
                <div class="mobile-color-grid">
                    <div class="mobile-color-option active" style="background: #171617;" data-mobile-wheel-color="#171617"></div>
                    <div class="mobile-color-option" style="background: #67655f;" data-mobile-wheel-color="#67655f"></div>
                    <div class="mobile-color-option" style="background: #fffff0;" data-mobile-wheel-color="#fffff0"></div>
                    <div class="mobile-color-option" style="background: #47d9e0;" data-mobile-wheel-color="#47d9e0"></div>
                    <div class="mobile-color-option" style="background: #cdf032;" data-mobile-wheel-color="#cdf032"></div>
                    <div class="mobile-color-option" style="background: #de2823;" data-mobile-wheel-color="#de2823"></div>
                    <div class="mobile-color-option" style="background: #ff7300;" data-mobile-wheel-color="#ff7300"></div>
                    <div class="mobile-color-option" style="background: #ff5cb6;" data-mobile-wheel-color="#ff5cb6"></div>
                    <div class="mobile-color-option" style="background: #3b083f;" data-mobile-wheel-color="#3b083f"></div>
                </div>
                
                <div class="mobile-color-picker-section">
                    <label class="mobile-color-picker-label">Custom Color</label>
                    <input type="color" class="mobile-color-picker-input" id="mobile-wheel-picker" value="#171617">
                </div>
            </div>
        `
    }
    
    getExportPanelHTML() {
        return `
            <div class="mobile-panel" data-mobile-panel="export">
                <div class="mobile-action-section">
                    <button class="mobile-action-btn" id="mobile-play-animation">
                        ▶️ Play Animation
                    </button>
                    
                    <button class="mobile-action-btn" id="mobile-save-animation">
                        🎬 Save Animation
                    </button>
                    
                    <button class="mobile-action-btn" id="mobile-save-image">
                        📸 Save Image
                    </button>
                    
                    <button class="mobile-action-btn" id="mobile-bakkesmod">
                        🎮 Generate BakkesMod Code
                    </button>
                    
                    <div class="mobile-bakkesmod-result" id="mobile-bakkesmod-result">
                        <div class="mobile-bakkesmod-code-container">
                            <input type="text" id="mobile-bakkesmod-code" readonly>
                            <button id="mobile-copy-code">📋</button>
                        </div>
                        <small>Paste this code in BakkesMod</small>
                    </div>
                </div>
            </div>
        `
    }
    
    getSettingsPanelHTML() {
        return `
            <div class="mobile-panel" data-mobile-panel="settings">
                <div class="mobile-setting-row">
                    <span class="mobile-setting-label">Music</span>
                    <div class="mobile-toggle" id="mobile-music-toggle"></div>
                </div>

                <div class="mobile-setting-row">
                    <span class="mobile-setting-label">Auto Rotate</span>
                    <div class="mobile-toggle active" id="mobile-rotation-toggle"></div>
                </div>
                
                <div class="mobile-range-row">
                    <div class="mobile-range-label">
                        <span>Rotation Speed</span>
                        <span class="mobile-range-value" id="mobile-rotation-value">0.5</span>
                    </div>
                    <input type="range" class="mobile-range-input" id="mobile-rotation-speed" 
                           min="0" max="2" step="0.1" value="0.5">
                </div>
                
                <div class="mobile-range-row">
                    <div class="mobile-range-label">
                        <span>Light Intensity</span>
                        <span class="mobile-range-value" id="mobile-light-value">1.0</span>
                    </div>
                    <input type="range" class="mobile-range-input" id="mobile-light-intensity" 
                           min="0" max="3" step="0.1" value="1.0">
                </div>
                
                <div class="mobile-range-row">
                    <div class="mobile-range-label">
                        <span>Environment</span>
                        <span class="mobile-range-value" id="mobile-env-value">0.4</span>
                    </div>
                    <input type="range" class="mobile-range-input" id="mobile-env-intensity" 
                           min="0" max="2" step="0.1" value="0.4">
                </div>
            </div>
        `
    }
    
    setupDrawerToggle() {
        const btn = document.querySelector('.mobile-customize-btn')
        const drawer = document.querySelector('.mobile-drawer')
        const handle = document.querySelector('.drawer-handle')
        
        if (!btn || !drawer || !handle) return
        
        const toggleDrawer = () => {
            this.isDrawerOpen = !this.isDrawerOpen
            drawer.classList.toggle('open', this.isDrawerOpen)
            
            // Désactive la rotation auto quand drawer ouvert
            if (this.experience?.camera?.controls) {
                this.experience.camera.controls.enabled = !this.isDrawerOpen
            }
        }
        
        btn.addEventListener('click', toggleDrawer)
        handle.addEventListener('click', toggleDrawer)
        
        // Swipe down pour fermer
        let startY = 0
        let currentY = 0
        
        handle.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY
        })
        
        handle.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY
            const deltaY = currentY - startY
            
            if (deltaY > 0 && this.isDrawerOpen) {
                drawer.style.transform = `translateY(${Math.min(deltaY, 200)}px)`
            }
        })
        
        handle.addEventListener('touchend', () => {
            const deltaY = currentY - startY
            
            if (deltaY > 100) {
                toggleDrawer()
            }
            
            drawer.style.transform = ''
        })
    }
    
    setupTabs() {
        const tabs = document.querySelectorAll('[data-mobile-tab]')
        const panels = document.querySelectorAll('[data-mobile-panel]')
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.mobileTab
                
                // Update tabs
                tabs.forEach(t => t.classList.remove('active'))
                tab.classList.add('active')
                
                // Update panels
                panels.forEach(p => p.classList.remove('active'))
                const panel = document.querySelector(`[data-mobile-panel="${targetPanel}"]`)
                if (panel) panel.classList.add('active')
                
                // Scroll tab into view
                tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
                
                // Update texture grid si nécessaire
                if (targetPanel === 'texture') {
                    this.updateMobileTextureGrid()
                }
            })
        })
    }
    
    setupCarSelection() {
        document.querySelectorAll('[data-mobile-car]').forEach(card => {
            card.addEventListener('click', () => {
                const carType = card.dataset.mobileCar
                
                document.querySelectorAll('[data-mobile-car]').forEach(c => c.classList.remove('active'))
                card.classList.add('active')
                
                // Délègue au UIManager desktop
                this.uiManager.updateCarSelection(carType)
            })
        })
    }
    
    setupWheelSelection() {
        document.querySelectorAll('[data-mobile-wheel]').forEach(card => {
            card.addEventListener('click', () => {
                const wheelType = card.dataset.mobileWheel
                
                document.querySelectorAll('[data-mobile-wheel]').forEach(c => c.classList.remove('active'))
                card.classList.add('active')
                
                this.uiManager.updateWheelSelection(wheelType)
            })
        })
    }
    
    setupPaintSelection() {
        // Preset colors
        document.querySelectorAll('[data-mobile-paint-color]').forEach(option => {
            option.addEventListener('click', () => {
                const color = option.dataset.mobilePaintColor
                
                document.querySelectorAll('[data-mobile-paint-color]').forEach(o => o.classList.remove('active'))
                option.classList.add('active')
                
                const picker = document.getElementById('mobile-paint-picker')
                if (picker) picker.value = color
                
                this.uiManager.updatePaintColor(color)
            })
        })
        
        // Color picker
        const picker = document.getElementById('mobile-paint-picker')
        if (picker) {
            picker.addEventListener('input', (e) => {
                this.uiManager.updatePaintColor(e.target.value)
                
                // Désactive les presets
                document.querySelectorAll('[data-mobile-paint-color]').forEach(o => o.classList.remove('active'))
            })
        }
    }
    
    setupWheelPaintSelection() {
        // Preset colors
        document.querySelectorAll('[data-mobile-wheel-color]').forEach(option => {
            option.addEventListener('click', () => {
                const color = option.dataset.mobileWheelColor
                
                document.querySelectorAll('[data-mobile-wheel-color]').forEach(o => o.classList.remove('active'))
                option.classList.add('active')
                
                const picker = document.getElementById('mobile-wheel-picker')
                if (picker) picker.value = color
                
                this.uiManager.updateWheelColor(color)
            })
        })
        
        // Color picker
        const picker = document.getElementById('mobile-wheel-picker')
        if (picker) {
            picker.addEventListener('input', (e) => {
                this.uiManager.updateWheelColor(e.target.value)
                
                // Désactive les presets
                document.querySelectorAll('[data-mobile-wheel-color]').forEach(o => o.classList.remove('active'))
            })
        }
    }
    
    setupFinishSelection() {
        const select = document.getElementById('mobile-finish-select')
        if (select) {
            select.addEventListener('change', (e) => {
                this.uiManager.updateFinish(e.target.value)
            })
        }
    }
    
    setupTextureSelection() {
        // Upload
        const fileInput = document.getElementById('mobile-texture-upload')
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0]
                if (!file) return
                
                // Utilise le même système que desktop
                if (this.experience?.world?.carsManager?.customTextureManager) {
                    const customTextureManager = this.experience.world.carsManager.customTextureManager
                    const currentCar = this.experience.world.carsManager.selectedCarType
                    
                    customTextureManager.loadFromFile(currentCar, file).then(texture => {
                        if (this.experience.world.carsManager.currentCar?.customizer) {
                            this.experience.world.carsManager.currentCar.customizer.applyCustomTexture(texture)
                        }
                        
                        // Update state
                        this.uiManager.carStates[currentCar].hasCustomTexture = true
                        this.uiManager.saveStatesToStorage()
                    })
                }
                
                e.target.value = ''
            })
        }
    }
    
    updateMobileTextureGrid() {
        const grid = document.getElementById('mobile-texture-grid')
        if (!grid) return
        
        grid.innerHTML = ''
        
        const currentCar = this.uiManager.currentCar
        const presets = this.uiManager.presetTexturesConfig[currentCar]
        if (!presets) return
        
        const state = this.uiManager.carStates[currentCar]
        
        presets.forEach((preset) => {
            const card = document.createElement('div')
            card.className = 'mobile-texture-card'
            card.dataset.mobileTexture = preset.name
            
            if (!state.hasCustomTexture && preset.name === state.selectedPresetTexture) {
                card.classList.add('active')
            }
            
            const img = document.createElement('img')
            img.src = preset.thumbnail || preset.path
            img.alt = preset.name
            
            card.appendChild(img)
            grid.appendChild(card)
            
            card.addEventListener('click', () => {
                this.uiManager.updatePresetTexture(preset.name)
                
                document.querySelectorAll('[data-mobile-texture]').forEach(c => c.classList.remove('active'))
                card.classList.add('active')
            })
        })
    }
    
    setupActions() {
        // Play animation
        const playBtn = document.getElementById('mobile-play-animation')
        if (playBtn) {
            playBtn.addEventListener('click', async () => {
                if (this.experience?.world?.carsManager) {
                    playBtn.style.opacity = '0.5'
                    await this.experience.world.carsManager.playEntryAnimation()
                    playBtn.style.opacity = '1'
                }
            })
        }
        
        // Save animation
        const saveAnimBtn = document.getElementById('mobile-save-animation')
        if (saveAnimBtn) {
            saveAnimBtn.addEventListener('click', async () => {
                const captureManager = this.experience?.world?.carsManager?.animator?.captureManager
                if (captureManager) {
                    await captureManager.recordAnimation(async () => {
                        return this.experience.world.carsManager.playEntryAnimation()
                    })
                }
            })
        }
        
        // Save image
        const saveImgBtn = document.getElementById('mobile-save-image')
        if (saveImgBtn) {
            saveImgBtn.addEventListener('click', async () => {
                const captureManager = this.experience?.world?.carsManager?.animator?.captureManager
                if (captureManager) {
                    saveImgBtn.style.opacity = '0.5'
                    await captureManager.captureImage()
                    saveImgBtn.style.opacity = '1'
                }
            })
        }
        
        // BakkesMod
        const bakkesBtn = document.getElementById('mobile-bakkesmod')
        const bakkesResult = document.getElementById('mobile-bakkesmod-result')
        const bakkesCode = document.getElementById('mobile-bakkesmod-code')
        const copyBtn = document.getElementById('mobile-copy-code')
        
        if (bakkesBtn && bakkesResult && bakkesCode) {
            bakkesBtn.addEventListener('click', () => {
                const carState = this.uiManager.carStates[this.uiManager.currentCar]
                const code = generateCodeFromState(carState, this.uiManager.currentCar)
                
                bakkesCode.value = code
                bakkesResult.classList.add('visible')
                
                // Auto copy
                navigator.clipboard.writeText(code).then(() => {
                    copyBtn.textContent = '✅'
                    setTimeout(() => {
                        copyBtn.textContent = '📋'
                    }, 2000)
                })
                
                // Auto hide after 5s
                setTimeout(() => {
                    bakkesResult.classList.remove('visible')
                }, 5000)
            })
            
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(bakkesCode.value).then(() => {
                        copyBtn.textContent = '✅'
                        setTimeout(() => {
                            copyBtn.textContent = '📋'
                        }, 2000)
                    })
                })
            }
        }
    }
    
    setupSettings() {
        // 🎵 MUSIQUE MOBILE
        let backgroundMusic = null;
        
        const musicToggle = document.getElementById('mobile-music-toggle');
        if (musicToggle) {
            // Charge l'audio
            backgroundMusic = new Audio('sounds/Rocket League Theme.mp3');
            backgroundMusic.loop = true;
            backgroundMusic.volume = 0.3; // 30% du volume
            
            musicToggle.addEventListener('click', () => {
                musicToggle.classList.toggle('active');
                const isActive = musicToggle.classList.contains('active');
                
                if (isActive) {
                    // Joue la musique
                    backgroundMusic.play().catch(err => {
                        console.warn('⚠️ Cannot play audio:', err);
                    });
                    console.log('🎵 Music: ON (mobile)');
                } else {
                    // Pause la musique
                    backgroundMusic.pause();
                    console.log('🎵 Music: OFF (mobile)');
                }
            });
        }
        // Rotation toggle
        const rotationToggle = document.getElementById('mobile-rotation-toggle')
        if (rotationToggle) {
            rotationToggle.addEventListener('click', () => {
                rotationToggle.classList.toggle('active')
                const isActive = rotationToggle.classList.contains('active')
                
                if (this.experience?.camera?.controls) {
                    this.experience.camera.controls.autoRotate = isActive
                }
            })
        }
        
        // Rotation speed
        const rotationSpeed = document.getElementById('mobile-rotation-speed')
        const rotationValue = document.getElementById('mobile-rotation-value')
        if (rotationSpeed && rotationValue) {
            rotationSpeed.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value)
                rotationValue.textContent = value.toFixed(1)
                
                if (this.experience?.camera?.controls) {
                    this.experience.camera.controls.autoRotateSpeed = value
                }
            })
        }
        
        // Light intensity
        const lightIntensity = document.getElementById('mobile-light-intensity')
        const lightValue = document.getElementById('mobile-light-value')
        if (lightIntensity && lightValue) {
            lightIntensity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value)
                lightValue.textContent = value.toFixed(1)
                
                if (this.experience?.world?.environment) {
                    this.experience.world.environment.setLightMultiplier(value)
                }
            })
        }
        
        // Env intensity
        const envIntensity = document.getElementById('mobile-env-intensity')
        const envValue = document.getElementById('mobile-env-value')
        if (envIntensity && envValue) {
            envIntensity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value)
                envValue.textContent = value.toFixed(1)
                
                if (this.experience?.world?.environment?.environmentMap) {
                    this.experience.world.environment.environmentMap.intensity = value
                    this.experience.world.environment.environmentMap.updateMaterials()
                }
            })
        }
    }
    
    updateAllMobilePanels() {
        // Met à jour tous les panneaux avec l'état actuel
        const currentCar = this.uiManager.currentCar
        const state = this.uiManager.carStates[currentCar]
        
        // Car
        document.querySelectorAll('[data-mobile-car]').forEach(card => {
            card.classList.toggle('active', card.dataset.mobileCar === currentCar)
        })
        
        // Wheels
        document.querySelectorAll('[data-mobile-wheel]').forEach(card => {
            card.classList.toggle('active', card.dataset.mobileWheel === state.wheelType)
        })
        
        // Paint
        document.querySelectorAll('[data-mobile-paint-color]').forEach(option => {
            option.classList.toggle('active', option.dataset.mobilePaintColor === state.paintColor)
        })
        
        // Wheel paint
        document.querySelectorAll('[data-mobile-wheel-color]').forEach(option => {
            option.classList.toggle('active', option.dataset.mobileWheelColor === state.wheelColor)
        })
        
        // Finish
        const finishSelect = document.getElementById('mobile-finish-select')
        if (finishSelect) finishSelect.value = state.finish
        
        // Textures
        this.updateMobileTextureGrid()
    }
    
    destroy() {
        const btn = document.querySelector('.mobile-customize-btn')
        const drawer = document.querySelector('.mobile-drawer')
        
        if (btn) btn.remove()
        if (drawer) drawer.remove()
    }
}