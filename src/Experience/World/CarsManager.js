import * as THREE from 'three'
import Experience from '../Experience.js'
import Car from './Car.js'
import WheelSet from './WheelSet.js'
import CarAnimator from './CarAnimator.js' // 🆕
import { wheelPositions } from '../configs/wheelPositions.js'
import TextureStorage from '../Utils/TextureStorage.js'
import CustomTextureManager from '../Utils/CustomtextureManager.js'

export default class CarsManager {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        
        this.currentCar = null
        this.currentWheels = null
        this.animator = new CarAnimator() // 🆕 Créé une seule fois

        this.textureStorage = new TextureStorage()
        this.customTextureManager = new CustomTextureManager(this.resources, this.textureStorage)
        
        // Sélections par défaut
        this.selectedCarType = 'octane'
        this.selectedWheelType = 'dieci'
        
        // Debug
        if(this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Vehicle Manager')
            this.setupDebug()
        }
        
        // Charge toutes les textures stockées au démarrage
        this.customTextureManager.loadAllStored().then(() => {
            // Setup initial après le chargement AVEC animation la première fois
            this.setupVehicle(this.selectedCarType, this.selectedWheelType, true)
            this.setupUI()
            this.setupTextureUploader()
        })
    }
    
    setupVehicle(carType, wheelType, animate = true) { // 🆕 Paramètre animate
        console.log(`🚗 Setting up vehicle: ${carType} with ${wheelType}`)
        
        // 🔧 D'abord détacher du groupe d'animation
        if (this.animator) {
            this.animator.detachVehicle()
        }
        
        // 🔧 Ensuite détruire l'ancien véhicule
        if (this.currentCar) {
            console.log('  🗑️ Destroying old car...')
            this.currentCar.destroy()
            this.currentCar = null
        }
        if (this.currentWheels) {
            console.log('  🗑️ Destroying old wheels...')
            this.currentWheels.destroy()
            this.currentWheels = null
        }
        
        // Vérifie que les ressources sont chargées
        if(!this.resources.items[carType]) {
            console.error(`❌ Car model ${carType} not loaded!`)
            return
        }
        if(!this.resources.items[wheelType]) {
            console.error(`❌ Wheel model ${wheelType} not loaded!`)
            return
        }

        // Vérifie si une texture custom existe
        const hasCustomTexture = this.customTextureManager.getTexture(carType) !== null
        this.showResetButton(hasCustomTexture)
        
        // 🔧 Crée la nouvelle voiture
        console.log('  🏗️ Creating new car...')
        this.currentCar = new Car(carType, this.resources.items[carType])
        
        // 🔧 Crée les roues avec la config appropriée
        console.log('  🏗️ Creating new wheels...')
        const wheelConfig = wheelPositions[carType]
        
        this.currentWheels = new WheelSet(
            wheelType, 
            this.resources.items[wheelType],
            wheelConfig
        )
        
        // 🔧 Attache au groupe d'animation
        console.log('  🔗 Attaching to animation group...')
        this.animator.attachVehicle(this.currentCar, this.currentWheels, carType) // 🆕 Passe carType
        
        // 🆕 Lance l'animation si demandé
        if (animate) {
            console.log('  🎬 Starting animation...')
            this.animator.startEntryAnimation().then(() => {
                console.log('✅ Car entry animation finished!')
            })
        }
        
        // Update les boutons UI
        this.updateUIState()
        
        console.log('✅ Vehicle setup complete!')
    }
    
    // 🆕 Méthode publique pour lancer l'animation
    async playEntryAnimation() {
        if (this.animator) {
            return this.animator.startEntryAnimation()
        }
    }
    
    switchCar(carType, wheelType = null) {
        if(carType === this.selectedCarType) return
        
        this.selectedCarType = carType
        
        // Utilise le wheelType passé en paramètre, sinon garde l'actuel
        const wheelsToUse = wheelType || this.selectedWheelType
        
        this.setupVehicle(carType, wheelsToUse, true) // 🆕 Anime lors du switch
    }
    
    switchWheels(wheelType) {
        if(wheelType === this.selectedWheelType) return
        
        this.selectedWheelType = wheelType
        this.setupVehicle(this.selectedCarType, wheelType, false) // Pas d'animation pour les roues
    }

    setupTextureUploader() {
        const fileInput = document.getElementById('texture-upload')
        const resetBtn = document.getElementById('reset-texture')
        
        if(!fileInput || !resetBtn) {
            console.error('❌ Texture uploader elements not found!')
            return
        }
        
        // Gestion de l'upload
        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0]
            if(!file) return
            
            // Vérifications
            if(!file.type.match('image/png') && !file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
                alert('Please select a PNG or JPG image!')
                return
            }
            
            if(file.size > 5 * 1024 * 1024) {
                alert('Image too large! Maximum size is 5MB.')
                return
            }
            
            try {
                // Charge et stocke la texture
                const texture = await this.customTextureManager.loadFromFile(this.selectedCarType, file)
                
                // Applique immédiatement à la voiture actuelle
                if(this.currentCar && this.currentCar.customizer) {
                    this.currentCar.customizer.applyCustomTexture(texture)
                    this.showResetButton(true)
                    console.log('✅ Custom texture applied!')
                }
            } catch (error) {
                console.error('❌ Failed to load texture:', error)
                alert('Failed to load texture!')
            }
            
            event.target.value = ''
        })
        
        // Gestion du reset
        resetBtn.addEventListener('click', () => {
            if(this.currentCar && this.currentCar.customizer) {
                // Réinitialise la texture
                this.currentCar.customizer.resetBodyTexture()
                
                // Supprime de resources + storage
                this.customTextureManager.removeTexture(this.selectedCarType)
                
                this.showResetButton(false)
                console.log('✅ Texture reset to default!')
            }
        })
    }
    
    showResetButton(show) {
        const resetBtn = document.getElementById('reset-texture')
        if(resetBtn) {
            resetBtn.style.display = show ? 'block' : 'none'
        }
    }
    
    setupUI() {
        // Boutons pour changer de voiture
        const carButtons = {
            'btn-fennec': 'fennec',
            'btn-octane': 'octane',
            'btn-dominus': 'dominus'
        }
        
        Object.entries(carButtons).forEach(([btnId, carType]) => {
            const btn = document.getElementById(btnId)
            if(btn) {
                btn.addEventListener('click', () => this.switchCar(carType))
            }
        })
        
        // Boutons pour changer de roues
        const wheelButtons = {
            'btn-alpha': 'alpha',
            'btn-cristiano': 'cristiano',
            'btn-dieci': 'dieci'
        }
        
        Object.entries(wheelButtons).forEach(([btnId, wheelType]) => {
            const btn = document.getElementById(btnId)
            if(btn) {
                btn.addEventListener('click', () => this.switchWheels(wheelType))
            }
        })
        
        this.updateUIState()
    }
    
    updateUIState() {
        // Retire la classe 'active' de tous les boutons
        document.querySelectorAll('.car-selector button').forEach(btn => {
            btn.classList.remove('active')
        })
        document.querySelectorAll('.wheel-selector button').forEach(btn => {
            btn.classList.remove('active')
        })
        
        // Ajoute 'active' aux boutons sélectionnés
        const carBtnMap = {
            'fennec': 'btn-fennec',
            'octane': 'btn-octane',
            'dominus': 'btn-dominus'
        }
        const wheelBtnMap = {
            'alpha': 'btn-alpha',
            'cristiano': 'btn-cristiano',
            'dieci': 'btn-dieci'
        }
        
        const activeCarBtn = document.getElementById(carBtnMap[this.selectedCarType])
        if(activeCarBtn) activeCarBtn.classList.add('active')
        
        const activeWheelBtn = document.getElementById(wheelBtnMap[this.selectedWheelType])
        if(activeWheelBtn) activeWheelBtn.classList.add('active')
    }
    
    setupDebug() {
        if(!this.debug.active) return
        
        const debugParams = {
            car: this.selectedCarType,
            wheels: this.selectedWheelType
        }
        
        this.debugFolder
            .add(debugParams, 'car', ['fennec', 'octane', 'dominus'])
            .name('Car Type')
            .onChange(value => this.switchCar(value))
        
        this.debugFolder
            .add(debugParams, 'wheels', ['alpha', 'cristiano', 'dieci'])
            .name('Wheel Type')
            .onChange(value => this.switchWheels(value))
        
        // Bouton pour tester l'animation
        const animationControls = {
            playAnimation: () => this.playEntryAnimation()
        }
        
        this.debugFolder
            .add(animationControls, 'playAnimation')
            .name('▶️ Play Animation')
        
        // Paramètres d'animation
        const animFolder = this.debugFolder.addFolder('Animation Settings')
        
        animFolder
            .add(this.animator.config, 'duration', 0.5, 5, 0.1)
            .name('Duration (s)')
        
        animFolder
            .add(this.animator.config, 'startX', -10, 0, 0.5)
            .name('Start X Position')
        
        animFolder
            .add(this.animator.config, 'wheelRadius', 0.05, 0.3, 0.01)
            .name('Wheel Radius')
    }
    
    update() {
        if(this.currentCar) {
            this.currentCar.update()
        }
        
        // 🆕 Update l'animator
        if(this.animator) {
            this.animator.update(this.experience.time.delta * 0.001)
        }
    }
    
    destroy() {
        if(this.currentCar) this.currentCar.destroy()
        if(this.currentWheels) this.currentWheels.destroy()
        if(this.animator) this.animator.destroy()
        
        if(this.debug.active && this.debugFolder) {
            this.debugFolder.destroy()
        }
    }
}