// src/Experience/World/CarAnimator.js
import * as THREE from 'three'
import Experience from '../Experience.js'
import CaptureManager from '../Utils/CaptureManager.js' // 🔧 Renommé

export default class CarAnimator {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        
        // 🆕 CaptureManager pour capture image/vidéo
        this.captureManager = new CaptureManager()
        
        // Groupe qui contiendra la voiture ET les roues
        this.vehicleGroup = new THREE.Group()
        this.scene.add(this.vehicleGroup)
        
        // Références
        this.car = null
        this.wheels = null
        
        // État de l'animation
        this.isAnimating = false
        this.animationProgress = 0
        
        // Paramètres d'animation
        this.config = {
            // Durée de l'animation (secondes)
            duration: 1.5,
            
            // Position de départ (hors écran sur X)
            startX: -2,
            
            // Position finale
            endX: 0,
            
            // Rayon de la roue pour calculer la rotation correcte
            // (ajuste selon la taille de tes roues)
            wheelRadius: 0.13,
            
            // Courbe d'accélération/décélération (easing)
            easing: this.easeInOutCubic
        }
        
        this.currentCarType = null
    }
    
    /**
     * Attache la voiture et les roues au groupe
     */
    attachVehicle(car, wheels, carType) { // 🆕 Ajouter carType
        console.log('🔗 Attaching vehicle to animation group...')
        
        // 🆕 Stocke le type de voiture
        this.currentCarType = carType
        
        // 🔧 Détache l'ancien véhicule si présent
        this.detachVehicle()
        
        // Sauvegarde les références
        this.car = car
        this.wheels = wheels
        
        // Ajoute la voiture au groupe
        if (this.car && this.car.model) {
            // Retire de la scène si présent
            if (this.car.model.parent === this.scene) {
                this.scene.remove(this.car.model)
            }
            this.vehicleGroup.add(this.car.model)
            // Reset la position locale de la voiture
            this.car.model.position.set(0, 0, 0)
            console.log('  ✅ Car attached')
        }
        
        // Ajoute les roues au groupe
        if (this.wheels && this.wheels.wheels) {
            let wheelCount = 0
            this.wheels.wheels.forEach(wheel => {
                // Retire de la scène si présent
                if (wheel.mesh.parent === this.scene) {
                    this.scene.remove(wheel.mesh)
                }
                this.vehicleGroup.add(wheel.mesh)
                wheelCount++
            })
            console.log(`  ✅ ${wheelCount} wheels attached for ${carType}`)
        }
        
        // Reset la position du groupe
        this.vehicleGroup.position.set(0, 0, 0)
        
        console.log('✅ Vehicle fully attached to animation group')
    }
    
    /**
     * Fonction d'easing pour une décélération/accélération réaliste
     * @param {number} t - Progression (0-1)
     */
    easeInOutCubic(t) {
        // Accélération en début, décélération en fin
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2
    }
    
    /**
     * Démarre l'animation d'arrivée
     */
    async startEntryAnimation() {
        if (this.isAnimating) {
            console.warn('⚠️ Animation already in progress')
            return
        }
        
        if (!this.car || !this.wheels) {
            console.error('❌ No vehicle attached!')
            return
        }
        
        console.log('🎬 Starting car entry animation...')
        
        this.isAnimating = true
        this.animationProgress = 0
        
        // Place le groupe à la position de départ
        this.vehicleGroup.position.x = this.config.startX
        
        // Reset la rotation des roues
        if (this.wheels) {
            this.wheels.wheels.forEach(wheel => {
                wheel.mesh.rotation.z = 0
            })
        }
        
        return new Promise((resolve) => {
            this.animationResolve = resolve
        })
    }
    
    /**
     * Met à jour l'animation (appelé dans la loop)
     * @param {number} deltaTime - Temps écoulé depuis la dernière frame (secondes)
     */
    update(deltaTime) {
        if (!this.isAnimating) return
        
        // Incrémente la progression
        this.animationProgress += deltaTime / this.config.duration
        
        // Clamp entre 0 et 1
        this.animationProgress = Math.min(this.animationProgress, 1)
        
        // Applique l'easing
        const easedProgress = this.config.easing(this.animationProgress)
        
        // Calcule la position actuelle du groupe
        const currentX = THREE.MathUtils.lerp(
            this.config.startX,
            this.config.endX,
            easedProgress
        )
        
        // Calcule la distance parcourue depuis la dernière frame
        const previousX = this.vehicleGroup.position.x
        const distance = currentX - previousX
        
        // Met à jour la position du groupe
        this.vehicleGroup.position.x = currentX
        
        // Calcule la rotation des roues basée sur la distance parcourue
        // formule: rotation (radians) = distance / rayon
        if (this.wheels && distance !== 0) {
            const baseRotation = distance / this.config.wheelRadius
            
            this.wheels.wheels.forEach((wheel, index) => {
                // 🔧 Détecte si la roue est retournée (rotation X proche de PI ou -PI)
                const isFlipped = Math.abs(wheel.mesh.rotation.x) > Math.PI / 2
                
                // Si la roue est retournée, inverse le sens de rotation
                const wheelRotation = isFlipped ? -baseRotation : baseRotation
                
                // Les roues tournent sur l'axe Z
                wheel.mesh.rotation.z -= wheelRotation
                
                // Debug (à retirer après test)
                if (index === 0) {
                    console.log(`Wheel rotation X: ${wheel.mesh.rotation.x.toFixed(2)}, isFlipped: ${isFlipped}`)
                }
            })
        }
        
        // Animation terminée
        if (this.animationProgress >= 1) {
            this.stopAnimation()
        }
    }
    
    /**
     * Arrête l'animation
     */
    stopAnimation() {
        this.isAnimating = false
        this.animationProgress = 0
        
        // Remet le groupe exactement à sa position finale
        this.vehicleGroup.position.x = this.config.endX
        
        console.log('✅ Animation completed!')
        
        if (this.animationResolve) {
            this.animationResolve()
            this.animationResolve = null
        }
    }
    
    /**
     * Réinitialise l'animation
     */
    reset() {
        this.isAnimating = false
        this.animationProgress = 0
        this.vehicleGroup.position.x = this.config.endX
        
        if (this.wheels) {
            this.wheels.wheels.forEach(wheel => {
                wheel.mesh.rotation.z = 0
            })
        }
    }
    
    /**
     * Détache le véhicule du groupe (pour le détruire proprement)
     */
    detachVehicle() {
        if (this.car) {
            this.vehicleGroup.remove(this.car.model)
            // Ne remet PAS dans la scène, on va le détruire
        }
        
        if (this.wheels) {
            this.wheels.wheels.forEach(wheel => {
                this.vehicleGroup.remove(wheel.mesh)
                // Ne remet PAS dans la scène, on va le détruire
            })
        }
        
        this.car = null
        this.wheels = null
        
        console.log('✅ Vehicle detached from animation group')
    }
    
    destroy() {
        this.stopAnimation()
        this.detachVehicle()
        this.scene.remove(this.vehicleGroup)
        this.vehicleGroup = null
    }
}